import { X, Award, Scissors } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import './PerfilCliente.css';

export default function PerfilCliente({ onClose }) {
  const [pontos, setPontos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function fetchPontos() {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      setUser(currentUser);

      try {
        const docRef = doc(db, "clientes", currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setPontos(docSnap.data().pontos || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar pontos:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchPontos();
  }, []);

  const meta = 10;
  const pontosRestantes = meta - (pontos % meta);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content perfil-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={22} /></button>

        <header className="perfil-header">
          <div className="avatar-user">
            {user?.displayName ? user.displayName[0].toUpperCase() : 'C'}
          </div>
          <h2>{user?.displayName || 'Cliente'}</h2>
          <p>{user?.email}</p>
        </header>

        <div className="fidelidade-box">
          <h3><Award size={18} color="var(--gold)" /> Meu Cartão Fidelidade</h3>
          
          {carregando ? (
            <p>Carregando pontos...</p>
          ) : (
            <>
              <div className="pontos-display">
                <strong>{pontos}</strong>
                <span>pontos acumulados</span>
              </div>

              <div className="progresso-cortes">
                {[...Array(meta)].map((_, index) => (
                  <div 
                    key={index} 
                    className={`corte-slot ${index < (pontos % meta) || (pontos > 0 && pontos % meta === 0 && index < meta) ? 'preenchido' : ''}`}
                  >
                    <Scissors size={16} />
                  </div>
                ))}
              </div>

              <p className="aviso-pontos">
                {pontos > 0 && pontos % meta === 0 
                  ? "🎉 Parabéns! Você ganhou um corte grátis!" 
                  : `Faltam ${pontosRestantes} cortes para ganhar um grátis!`}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}