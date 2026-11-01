import { Scissors, LogOut, Store, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import PerfilCliente from './PerfilCliente'; 
import './Navbar.css';

export default function Navbar({ onLoginClick, onBookClick }) {
  const [user, setUser] = useState(null);
  const [perfilOpen, setPerfilOpen] = useState(false); 
  const [menuOpen, setMenuOpen] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  async function handleLogout() {
    await signOut(auth);
    alert('Você saiu da conta.');
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/" className="logo">
            <Scissors size={24} color="#C9A961" />
            <span>NAVALHA<em>d'Or</em></span>
          </a>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#barbeiros" onClick={() => setMenuOpen(false)}>Barbeiros</a></li>
            <li><a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</a></li>
            <li><a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</a></li>
            
            <li>
              <button 
                onClick={() => { 
                  localStorage.setItem('intencao', 'barbeiro'); // <-- MARCA A INTENÇÃO AQUI
                  navigate('/planos'); 
                  setMenuOpen(false); 
                }} 
                style={{ background: 'none', color: 'var(--gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Store size={16} /> Sou Barbeiro
              </button>
            </li>

            {user ? (
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => { setPerfilOpen(true); setMenuOpen(false); }}
                  style={{ background: 'none', color: 'var(--gold)', fontWeight: '600', fontSize: '14px' }}
                >
                  Olá, {user.displayName ? user.displayName.split(' ')[0] : 'Cliente'}
                </button>
                <button className="btn-outline" onClick={handleLogout}>
                  <LogOut size={16} /> Sair
                </button>
              </li>
            ) : (
              <li>
                <button className="btn-outline" onClick={() => { onLoginClick(); setMenuOpen(false); }}>
                  Entrar
                </button>
              </li>
            )}
            
            <li><button className="btn-primary" onClick={() => { onBookClick(); setMenuOpen(false); }}>Agendar</button></li>
          </ul>
        </div>
      </nav>

      {perfilOpen && <PerfilCliente onClose={() => setPerfilOpen(false)} />}
    </>
  );
}