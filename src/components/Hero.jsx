import './Hero.css';

export default function Hero({ onBookClick }) {
  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-tagline">— Desde 2024 —</span>
        <h1>
          Tradição,<br />
          <em>Estilo</em> &<br />
          Navalha de Ouro
        </h1>
        <p>
          Agende seu horário em segundos. Barbearia clássica com atendimento
          premium e profissionais especializados.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={onBookClick}>
            Agendar Horário
          </button>
          <button className="btn-outline">Ver Serviços</button>
        </div>
      </div>

      <div className="hero-visual">
        <div className="gold-ring"></div>
        <div className="hero-quote">
          <span>"</span>
          <p>O corte perfeito não é sobre cabelo. É sobre confiança.</p>
        </div>
      </div>
    </section>
  );
}