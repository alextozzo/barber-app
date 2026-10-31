import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar, DollarSign, Users, Scissors, Award } from 'lucide-react'; // Adicionado Award aqui
import './Layout.css';

export default function Layout() {
  const location = useLocation(); 

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
          
          {/* NOVO LINK: Fidelidade */}
          <Link to="/fidelidade" className={location.pathname === '/fidelidade' ? 'active' : ''}>
            <Award size={18} /> Fidelidade
          </Link>

          <a href="#"><Users size={18} /> Clientes</a>
          <a href="#"><DollarSign size={18} /> Financeiro</a>
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