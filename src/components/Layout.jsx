import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Users, Briefcase, Award, CreditCard, Store, BarChart2 } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './Layout.css';

export default function Layout() {
  const location = useLocation(); 
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/'); 
        return;
      }

      try {
        const docRef = doc(db, "barbearias", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const dadosLoja = docSnap.data();
          
          // 1. Verifica se o pagamento está pendente de aprovação
          if (dadosLoja.statusPagamento === 'pendente_aprovacao') {
            alert("⏳ Seu pagamento está em análise.\n\nAguarde a liberação do administrador.");
            navigate('/planos');
            return; // Para a execução aqui
          }

          // 2. Verifica se a loja está ativa e tem validade
          if (dadosLoja.statusPagamento === 'ativo' || dadosLoja.statusPagamento === 'aprovado') {
            if (!dadosLoja.validadePlano) {
              // Ativo mas sem data de validade (erro de cadastro, bloqueia)
              alert("⚠️ Sua assinatura não possui validade definida. Entre em contato com o suporte.");
              navigate('/planos');
              return;
            }

            const hoje = new Date();
            const validade = new Date(dadosLoja.validadePlano);

            if (validade < hoje) {
              // Assinatura venceu!
              alert("⚠️ Sua assinatura expirou!\n\nPor favor, renove seu plano para continuar usando o sistema.");
              navigate('/planos'); 
              return;
            }
          } else {
            // Qualquer outro status (ex: 'pendente', 'bloqueado') bloqueia o acesso
            alert("⚠️ Sua loja não está ativa. Por favor, regularize sua assinatura.");
            navigate('/planos');
            return;
          }
        } else {
          // Se não encontrar a loja, manda para criar
          navigate('/criar-loja');
          return;
        }
      } catch (error) {
        console.error("Erro ao verificar validade:", error);
      } finally {
        setCarregando(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Enquanto verifica, mostra uma tela de loading
  if (carregando) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Verificando acesso...</div>;
  }

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <Store size={20} color="var(--primary)" style={{ marginBottom: '8px' }} />
          <span>Quero1<em>Horario</em></span>
        </div>
        <nav>
          <Link to="/painel" className={location.pathname === '/painel' ? 'active' : ''}>
            <Calendar size={18} /> Agenda
          </Link>
          
          <Link to="/servicos" className={location.pathname === '/servicos' ? 'active' : ''}>
            <Briefcase size={18} /> Serviços
          </Link>
          
          <Link to="/equipe" className={location.pathname === '/equipe' ? 'active' : ''}>
            <Users size={18} /> Equipe
          </Link>
          <Link to="/fidelidade" className={location.pathname === '/fidelidade' ? 'active' : ''}>
            <Award size={18} /> Fidelidade
          </Link>
          <Link to="/assinaturas" className={location.pathname === '/assinaturas' ? 'active' : ''}>
            <CreditCard size={18} /> Assinaturas
          </Link>
          <Link to="/financeiro" className={location.pathname === '/financeiro' ? 'active' : ''}>
            <BarChart2 size={18} /> Financeiro
          </Link>

          <a href="#"><Users size={18} /> Clientes</a>
        </nav>
        <Link to="/" className="btn-outline logout-btn">
          <LogOut size={16} /> Sair
        </Link>
      </aside>

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}