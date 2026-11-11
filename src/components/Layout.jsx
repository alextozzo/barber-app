import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Calendar, Users, Briefcase, Award, CreditCard, Store, BarChart2, Menu, X, ExternalLink, Settings } from 'lucide-react'; // Adicionei Settings
import { db, auth } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import './Layout.css';

export default function Layout() {
  const location = useLocation(); 
  const navigate = useNavigate();
  const [carregando, setCarregando] = useState(true);
  const [menuAberto, setMenuAberto] = useState(false);
  const [slugLoja, setSlugLoja] = useState('');

  useEffect(() => {
    let unsubscribeLoja = null;

    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate('/'); 
        return;
      }

      const docRef = doc(db, "barbearias", user.uid);
      unsubscribeLoja = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const dadosLoja = docSnap.data();
          
          if (dadosLoja.slug) {
            setSlugLoja(dadosLoja.slug);
          }

          if (dadosLoja.statusPagamento === 'pendente_aprovacao') {
            alert("⏳ Seu pagamento está em análise.\n\nAguarde a liberação do administrador.");
            navigate('/planos');
            setCarregando(false);
            return;
          }

          if (dadosLoja.statusPagamento === 'ativo' || dadosLoja.statusPagamento === 'aprovado') {
            if (!dadosLoja.validadePlano) {
              alert("⚠️ Sua assinatura não possui validade definida. Entre em contato com o suporte.");
              navigate('/planos');
              setCarregando(false);
              return;
            }

            const hoje = new Date();
            const validade = new Date(dadosLoja.validadePlano);

            if (validade < hoje) {
              alert("⚠️ Sua assinatura expirou!\n\nPor favor, renove seu plano para continuar usando o sistema.");
              navigate('/planos'); 
              setCarregando(false);
              return;
            }
          } else {
            alert("⚠️ Sua loja não está ativa. Por favor, regularize sua assinatura.");
            navigate('/planos');
            setCarregando(false);
            return;
          }
        } else {
          navigate('/criar-loja');
          setCarregando(false);
          return;
        }
        setCarregando(false);
      });
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeLoja) unsubscribeLoja();
    };
  }, [navigate]);

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  if (carregando) {
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: 'var(--primary)' }}>Verificando acesso...</div>;
  }

  return (
    <div className="dashboard-container">
      <button className="menu-mobile-btn" onClick={() => setMenuAberto(!menuAberto)}>
        {menuAberto ? <X size={24} /> : <Menu size={24} />}
      </button>

      {menuAberto && <div className="menu-overlay" onClick={() => setMenuAberto(false)}></div>}

      <aside className={`sidebar ${menuAberto ? 'open' : ''}`}>
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

          {/* NOVO BOTÃO: MEU NEGÓCIO (ALTERAR FOTOS/DADOS) */}
          <Link to="/criar-loja" className={location.pathname === '/criar-loja' ? 'active' : ''}>
            <Settings size={18} /> Meu Negócio
          </Link>

          {/* BOTÃO: VER MINHA LOJA (ABRE EM OUTRA ABA) */}
          {slugLoja && (
            <a 
              href={`/${slugLoja}`} 
              target="_blank" 
              rel="noreferrer"
              style={{ color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px', borderTop: '1px solid var(--border)', paddingTop: '16px' }}
            >
              <ExternalLink size={18} /> Ver Minha Loja
            </a>
          )}

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