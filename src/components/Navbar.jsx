import { Scissors, LogOut, Store } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import para navegar
import PerfilCliente from './PerfilCliente'; 
import './Navbar.css';

export default function Navbar({ onLoginClick, onBookClick }) {
  const [user, setUser] = useState(null);
  const [perfilOpen, setPerfilOpen] = useState(false); 
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
  }

  return (
    <>
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
            
            {/* NOVO LINK: Sou Barbeiro */}
            <li>
              <button 
                onClick={() => navigate('/criar-loja')} 
                style={{ background: 'none', color: 'var(--gold)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Store size={16} /> Sou Barbeiro
              </button>
            </li>

            {user ? (
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => setPerfilOpen(true)}
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
                <button className="btn-outline" onClick={onLoginClick}>
                  Entrar
                </button>
              </li>
            )}
            
            <li><button className="btn-primary" onClick={onBookClick}>Agendar</button></li>
          </ul>
        </div>
      </nav>

      {perfilOpen && <PerfilCliente onClose={() => setPerfilOpen(false)} />}
    </>
  );
}