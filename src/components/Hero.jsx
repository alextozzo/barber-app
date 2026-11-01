import './Hero.css';
import { Calendar, CheckCircle, Clock } from 'lucide-react';

export default function Hero({ onBookClick }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tagline">— A AGENDA DO SEU NEGÓCIO —</span>
        <h1>
          Sua agenda<br />
          <em>inteligente</em>,<br />
          sem complicação.
        </h1>
        <p>
          Agendamento online 24h, controle de clientes e gestão de equipe. Tudo em uma única plataforma, feita para o seu negócio.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={onBookClick}>
            Começar Agora Grátis
          </button>
        </div>
        <div className="hero-trust">
          <span><CheckCircle size={16} color="var(--primary)" /> Sem cartão de crédito</span>
          <span><CheckCircle size={16} color="var(--primary)" /> Cancele quando quiser</span>
        </div>
      </div>

      {/* MOCKUP DO CELULAR */}
      <div className="hero-visual">
        <div className="phone-mockup">
          <div className="phone-notch"></div>
          <div className="phone-screen">
            <div className="app-header">
              <div className="app-avatar"></div>
              <div>
                <p className="app-greeting">Bom dia, Rafael</p>
                <p className="app-date">Segunda, 04 de Nov.</p>
              </div>
            </div>
            
            <div className="app-card">
              <div className="app-card-header">
                <Clock size={16} color="var(--primary)" />
                <span>Próximo Cliente</span>
              </div>
              <div className="app-client">
                <strong>João Silva</strong>
                <span>Corte + Barba • 10:30</span>
              </div>
              <button className="app-btn">Confirmar</button>
            </div>

            <div className="app-stats">
              <div className="app-stat">
                <strong>12</strong>
                <span>Hoje</span>
              </div>
              <div className="app-stat">
                <strong>R$ 840</strong>
                <span>Previsto</span>
              </div>
            </div>
          </div>
        </div>
        <div className="glow-effect"></div>
      </div>
    </section>
  );
}