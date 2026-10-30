import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar, DollarSign, Users, Scissors } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const location = useLocation(); // Descobre em qual página estamos

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <div className="sidebar-logo">NAVALHA d'Or</div>
        <nav>
          <Link to="/painel" className={location.pathname === '/painel' ? 'active' : ''}>
            <Calendar size={18} /> Agenda
          </Link>
          <Link to="/servicos" className={location.pathname === '/servicos' ? 'active' : ''}>
            <Scissors size={18} /> Serviços
          </Link>
          <a href="#"><Users size={18} /> Clientes</a>
          <a href="#"><DollarSign size={18} /> Financeiro</a>
        </nav>
        <Link to="/" className="btn-outline logout-btn">
          <LogOut size={16} /> Sair
        </Link>
      </aside>

      <main className="dashboard-content">
        {/* O Outlet é onde a página (Dashboard ou Serviços) vai aparecer */}
        <Outlet />
      </main>
    </div>
  );
}