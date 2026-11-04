import { Outlet, Link, useLocation } from 'react-router-dom';
import { LogOut, Calendar, Users, Briefcase, Award, CreditCard, Store, BarChart2 } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const location = useLocation(); 

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

          {/* LINK DE CLIENTES CORRIGIDO */}
          <Link to="/clientes" className={location.pathname === '/clientes' ? 'active' : ''}>
            <Users size={18} /> Clientes
          </Link>
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