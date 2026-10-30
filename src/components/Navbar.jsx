import { Scissors } from 'lucide-react';
import './Navbar.css';

export default function Navbar({ onLoginClick, onBookClick }) {
  return (
    <nav className="navbar">
      <div className="nav-container">
        <a href="/" className="logo">
          <Scissors size={24} color="#C9A961" />
          <span>NAVALHA<em>d'Or</em></span>
        </a>

        <ul className="nav-links">
          <li><a href="#barbeiros">Barbeiros</a></li>
          <li><a href="#servicos">Serviços</a></li>
          <li><a href="#sobre">Sobre</a></li>
          <li><button className="btn-outline" onClick={onLoginClick}>Entrar</button></li>
          <li><button className="btn-primary" onClick={onBookClick}>Agendar</button></li>
        </ul>
      </div>
    </nav>
  );
}