import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Scissors, Crown, Zap } from 'lucide-react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import LoginModal from '../components/LoginModal';
import './Planos.css';

export default function Planos() {
  const navigate = useNavigate();
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(undefined);
  const [jaTemLoja, setJaTemLoja] = useState(false);
  const [verificando, setVerificando] = useState(true);
  const [intencao, setIntencao] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Verifica se o usuário veio da tela de Planos (intenção)
    const intencaoSalva = localStorage.getItem('intencao');
    setIntencao(intencaoSalva);

    // Verifica se o usuário já tem loja
    async function verificarLoja() {
      if (!user) {
        setVerificando(false);
        return;
      }
      const lojaRef = doc(db, "barbearias", user.uid);
      const lojaSnap = await getDoc(lojaRef);
      if (lojaSnap.exists()) {
        setJaTemLoja(true);
      }
      setVerificando(false);
    }
    verificarLoja();
  }, [user]);

  const planos = [
    // ... (mantenha os planos como estão)
    {
      id: 'basico',
      nome: 'Plano Básico',
      preco: '29',
      descricao: 'Para quem está começando a organizar a agenda e parar de perder tempo no WhatsApp.',
      icone: <Scissors size={24} />,
      features: [
        'Link exclusivo para bio do Instagram',
        'Agendamento online 24h',
        'Cadastro de até 5 serviços',
        'Painel de controle simples',
        'Notificação no WhatsApp'
      ]
    },
    {
      id: 'pro',
      nome: 'Plano Pro',
      preco: '49',
      descricao: 'Para profissionais que querem crescer, fidelizar clientes e ter controle total do negócio.',
      icone: <Zap size={24} />,
      destaque: true,
      features: [
        'Tudo do Plano Básico',
        'Serviços ilimitados',
        'Gestão de clientes e histórico',
        'Relatórios de faturamento',
        'Bloqueio automático de horários',
        'Suporte prioritário'
      ]
    },
    {
      id: 'premium',
      nome: 'Plano Premium',
      preco: '79',
      descricao: 'A solução completa para estúdios e salões com múltiplos profissionais.',
      icone: <Crown size={24} />,
      features: [
        'Tudo do Plano Pro',
        'Gestão de equipe (múltiplos profissionais)',
        'Cartão Fidelidade digital',
        'Personalização da cor da sua marca',
        'Página exclusiva com sua identidade'
      ]
    }
  ];

  async function escolherPlano(planoId) {
    localStorage.setItem('planoEscolhido', planoId);

    if (user) {
      try {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);

        if (lojaSnap.exists()) {
          await updateDoc(lojaRef, { 
            plano: planoId,
            statusPagamento: 'pendente'
          });
          alert(`✅ Plano alterado para ${planoId.toUpperCase()}! Efetue o pagamento para liberar.`);
          navigate('/checkout');
          return;
        }
      } catch (error) {
        console.error("Erro ao atualizar plano:", error);
      }
    }

    localStorage.setItem('intencao', 'profissional');
    localStorage.setItem('abrirLogin', 'true');
    navigate('/');
  }

  // Tela de carregamento
  if (verificando) return <p style={{ padding: '40px', color: 'var(--muted)', textAlign: 'center' }}>Verificando...</p>;

  // Se já tem loja, bloqueia
  if (jaTemLoja) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Você já tem uma loja ativa!</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>Acesse seu painel para gerenciar sua agenda.</p>
        <Link to="/painel" className="btn-primary">Ir para o Painel</Link>
      </div>
    );
  }

  // Se não tem intenção de ser profissional, bloqueia
  if (!intencao || intencao !== 'profissional') {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2 style={{ color: 'var(--primary)', marginBottom: '16px' }}>Área para Profissionais</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '24px' }}>
          Esta área é destinada a profissionais que desejam criar uma loja e receber agendamentos.
        </p>
        <button 
          className="btn-primary" 
          onClick={() => { 
            localStorage.setItem('intencao', 'profissional');
            navigate('/planos');
            window.location.reload();
          }}
        >
          Quero ser Profissional
        </button>
        <Link to="/" className="btn-outline" style={{ marginLeft: '12px' }}>Voltar para o Início</Link>
      </div>
    );
  }

  return (
    <div className="planos-container">
      <header className="planos-header">
        <Link to="/" className="logo-voltar">← Voltar</Link>
        <span className="tagline">— Escolha seu Plano —</span>
        <h1>Invista no crescimento do seu <em>negócio</em></h1>
        <p>Cancele quando quiser. Sem taxa de adesão. Sem porcentagem nas vendas.</p>
      </header>

      <div className="planos-grid">
        {planos.map((plano) => (
          <div key={plano.id} className={`plano-card card ${plano.destaque ? 'destaque' : ''}`}>
            {plano.destaque && <div className="badge-destaque">Mais Popular</div>}
            
            <div className="plano-icone">{plano.icone}</div>
            <h3>{plano.nome}</h3>
            <p className="plano-desc">{plano.descricao}</p>
            
            <div className="plano-preco">
              <span>R$</span>
              <strong>{plano.preco}</strong>
              <span>/mês</span>
            </div>

            <ul className="plano-features">
              {plano.features.map((feature, index) => (
                <li key={index}>
                  <Check size={16} color="var(--primary)" /> {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`btn-primary full ${plano.destaque ? '' : 'btn-outline'}`}
              onClick={() => escolherPlano(plano.id)}
            >
              Começar Agora
            </button>
          </div>
        ))}
      </div>

      <section className="upgrade-beneficios">
        <div className="section-header">
          <span className="section-tagline">— Por que fazer Upgrade? —</span>
          <h2>O que você ganha ao <em>subir de plano</em></h2>
        </div>
        
        <div className="beneficios-grid">
          <div className="beneficio-card card">
            <div className="beneficio-icon">📊</div>
            <h3>Relatórios Financeiros</h3>
            <p>Saiba exatamente quanto você faturou no mês, qual é o seu ticket médio e quais serviços vendem mais.</p>
          </div>
          <div className="beneficio-card card">
            <div className="beneficio-icon">👥</div>
            <h3>Gestão de Equipe</h3>
            <p>Adicione outros profissionais, defina comissões e deixe o cliente escolher com quem quer ser atendido.</p>
          </div>
          <div className="beneficio-card card">
            <div className="beneficio-icon">💳</div>
            <h3>Cartão Fidelidade</h3>
            <p>Fidelize seus clientes com pontos e faça eles voltarem sempre. Cliente fiel é cliente que gasta mais.</p>
          </div>
          <div className="beneficio-card card">
            <div className="beneficio-icon">🎨</div>
            <h3>Personalização da Marca</h3>
            <p>Mude a cor da sua página para combinar com a identidade visual do seu negócio.</p>
          </div>
        </div>
      </section>

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}
    </div>
  );
}