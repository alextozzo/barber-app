import { Scissors, LogOut, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import './Navbar.css';

export default function Navbar({ onLoginClick, onBookClick }) {
  const [user, setUser] = useState(null);

  // Fica "escutando" se o usuário logou ou deslogou
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
          
          {user ? (
            // Se estiver logado, mostra o botão de Sair
            <li>
              <button className="btn-outline" onClick={handleLogout}>
                <LogOut size={16} /> Sair
              </button>
            </li>
          ) : (
            // Se não estiver logado, mostra o botão Entrar
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
  );
}