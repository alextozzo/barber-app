import { useState, useEffect } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Sparkles, Smartphone, CalendarCheck, Users, Award, ArrowRight, Link as LinkIcon } from 'lucide-react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [loginOpen, setLoginOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const abrirLogin = localStorage.getItem('abrirLogin');
    if (abrirLogin === 'true') {
      setLoginOpen(true);
      localStorage.removeItem('abrirLogin'); 
    }
  }, [location]);

  return (
    <>
      <Navbar 
        onLoginClick={() => setLoginOpen(true)} 
        onBookClick={() => setLoginOpen(true)} 
      />
      
      <Hero onBookClick={() => navigate('/planos')} />

      <section className="section-features">
        <div className="section-header">
          <span className="section-tagline">— Tudo em um só lugar —</span>
          <h2>O que o <em>Quero1Horario</em> faz por você?</h2>
        </div>
        
        <div className="features-grid">
          <div className="feature-card card">
            <div className="feature-icon"><LinkIcon size={24} /></div>
            <h3>Seu Link Exclusivo</h3>
            <p>Uma página só sua para colocar na bio do Instagram e receber agendamentos 24h.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon"><CalendarCheck size={24} /></div>
            <h3>Agenda Inteligente</h3>
            <p>Bloqueio automático de horários, controle de almoço e organização total.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon"><Users size={24} /></div>
            <h3>Gestão de Equipe</h3>
            <p>Adicione outros profissionais e deixe o cliente escolher com quem quer ser atendido.</p>
          </div>
          <div className="feature-card card">
            <div className="feature-icon"><Award size={24} /></div>
            <h3>Cartão Fidelidade</h3>
            <p>Fidelize seus clientes com pontos e faça eles voltarem sempre.</p>
          </div>
        </div>
      </section>

      <section className="section-como-funciona">
        <div className="section-header">
          <span className="section-tagline">— Simples e Rápido —</span>
          <h2>Comece em <em>3 passos</em></h2>
        </div>
        
        <div className="passos-grid">
          <div className="passo-card">
            <div className="passo-numero">1</div>
            <h3>Crie sua Loja</h3>
            <p>Escolha seu nicho e personalize sua página.</p>
          </div>
          <div className="passo-card">
            <div className="passo-numero">2</div>
            <h3>Cadastre Serviços</h3>
            <p>Adicione serviços, preços e horários.</p>
          </div>
          <div className="passo-card">
            <div className="passo-numero">3</div>
            <h3>Compartilhe</h3>
            <p>Cole o link na bio e comece a agendar.</p>
          </div>
        </div>
      </section>

      <section className="section-nichos">
        <div className="section-header">
          <span className="section-tagline">— Para Todos os Talentos —</span>
          <h2>Feito para o seu <em>negócio</em></h2>
        </div>
        
        <div className="nichos-grid">
          <div className="nicho-item">
            <Sparkles size={32} color="var(--primary)" />
            <h4>Barbearias</h4>
          </div>
          <div className="nicho-item">
            <Sparkles size={32} color="var(--primary)" />
            <h4>Manicures</h4>
          </div>
          <div className="nicho-item">
            <Smartphone size={32} color="var(--primary)" />
            <h4>Tatuadores</h4>
          </div>
          <div className="nicho-item">
            <Sparkles size={32} color="var(--primary)" />
            <h4>Estética</h4>
          </div>
        </div>
      </section>

      <section className="section-cta">
        <div className="cta-card card">
          <h2>Pronto para lotar sua agenda?</h2>
          <p>Junte-se aos profissionais que já estão usando o Quero1Horario para crescer.</p>
          <Link to="/planos" className="btn-primary cta-btn">
            Começar Agora <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}

      <style>{`
        .section-features, .section-como-funciona, .section-nichos, .section-cta {
          max-width: 1200px;
          margin: 100px auto;
          padding: 0 24px;
        }

        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-tagline {
          color: var(--primary);
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
        .section-header h2 {
          font-size: 48px;
          margin-top: 16px;
          color: var(--cream);
        }
        .section-header h2 em {
          color: var(--primary);
          font-style: italic;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 24px;
        }
        .feature-card {
          padding: 32px;
          text-align: center;
        }
        .feature-icon {
          width: 56px;
          height: 56px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
          margin: 0 auto 20px;
        }
        .feature-card h3 { font-size: 18px; color: var(--cream); margin-bottom: 12px; }
        .feature-card p { color: var(--muted); font-size: 14px; line-height: 1.6; }

        .passos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 32px;
        }
        .passo-card {
          text-align: center;
          position: relative;
        }
        .passo-numero {
          width: 48px;
          height: 48px;
          background: var(--primary);
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 24px;
          font-weight: bold;
          margin: 0 auto 20px;
        }
        .passo-card h3 { font-size: 20px; color: var(--cream); margin-bottom: 12px; }
        .passo-card p { color: var(--muted); font-size: 14px; }

        .nichos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 20px;
        }
        .nicho-item {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 32px;
          text-align: center;
          transition: all 0.3s;
        }
        .nicho-item:hover {
          border-color: var(--primary);
          transform: translateY(-5px);
        }
        .nicho-item h4 {
          color: var(--cream);
          font-size: 16px;
          margin-top: 16px;
        }

        .cta-card {
          text-align: center;
          padding: 60px 40px;
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.05) 100%);
          border-color: var(--primary);
        }
        .cta-card h2 { font-size: 40px; color: var(--cream); margin-bottom: 16px; }
        .cta-card p { color: var(--muted); margin-bottom: 32px; font-size: 16px; }
        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .section-header h2 { font-size: 32px; }
          .cta-card h2 { font-size: 28px; }
        }
      `}</style>
    </>
  );
}