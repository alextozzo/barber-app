import { LogOut, Store, Menu, X, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
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
    localStorage.removeItem('logado');
    alert('Você saiu da conta.');
    setMenuOpen(false);
  }

  // Verifica se o usuário já tem loja e redireciona
  async function handleProfissionalClick() {
    const currentUser = auth.currentUser;

    if (currentUser) {
      const lojaRef = doc(db, "barbearias", currentUser.uid);
      const lojaSnap = await getDoc(lojaRef);

      if (lojaSnap.exists()) {
        // Já tem loja, vai direto para o painel
        navigate('/painel');
        setMenuOpen(false);
        return;
      }
    }

    // Se não tem loja ou não está logado, vai para Planos
    localStorage.setItem('intencao', 'profissional');
    navigate('/planos');
    setMenuOpen(false);
  }

  return (
    <>
      <nav className="navbar">
        <div className="nav-container">
          <a href="/" className="logo">
            <Calendar size={24} color="var(--primary)" />
            <span>Agenda<em>ê</em></span>
          </a>

          <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <ul className={`nav-links ${menuOpen ? 'open' : ''}`}>
            <li><a href="#profissionais" onClick={() => setMenuOpen(false)}>Profissionais</a></li>
            <li><a href="#servicos" onClick={() => setMenuOpen(false)}>Serviços</a></li>
            <li><a href="#sobre" onClick={() => setMenuOpen(false)}>Sobre</a></li>
            
            <li>
              <button 
                onClick={handleProfissionalClick} 
                style={{ background: 'none', color: 'var(--primary)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Store size={16} /> Sou Profissional
              </button>
            </li>

            {user ? (
              <li style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={() => { 
                    navigate('/minha-conta'); 
                    setMenuOpen(false); 
                  }}
                  style={{ background: 'none', color: 'var(--cream)', fontWeight: '600', fontSize: '14px' }}
                >
                  Olá, {user.displayName ? user.displayName.split(' ')[0] : 'Cliente'}
                </button>
                <button className="btn-outline" onClick={handleLogout}>
                  <LogOut size={16} /> Sair
                </button>
              </li>
            ) : (
              <li>
                <button 
                  className="btn-outline" 
                  onClick={() => { 
                    localStorage.removeItem('intencao');
                    onLoginClick(); 
                    setMenuOpen(false); 
                  }}
                >
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