import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Award, Power } from 'lucide-react';
import './Fidelidade.css';

export default function Fidelidade() {
  const [ativo, setAtivo] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchLoja() {
      if (!usuario) return;
      try {
        const docRef = doc(db, "barbearias", usuario.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setAtivo(data.fidelidadeAtiva || false);
        }
      } catch (error) {
        console.error("Erro ao buscar:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchLoja();
  }, [usuario]);

  async function toggleFidelidade() {
    if (!usuario) return;
    
    try {
      const docRef = doc(db, "barbearias", usuario.uid);
      await updateDoc(docRef, { fidelidadeAtiva: !ativo });
      setAtivo(!ativo);
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao atualizar.");
    }
  }

  if (carregando) return <p style={{ padding: '40px', color: 'var(--muted)' }}>Carregando...</p>;
  if (!usuario) return <p style={{ padding: '40px', color: 'var(--danger)' }}>Você precisa estar logado.</p>;

  return (
    <div className="fidelidade-container">
      <header className="fidelidade-header">
        <Award size={32} color="var(--gold)" />
        <h1>Cartão Fidelidade</h1>
        <p>Recompense seus clientes e faça eles voltarem sempre.</p>
      </header>

      <div className="fidelidade-card card">
        <div className="fidelidade-status">
          <h3>Status da Fidelidade</h3>
          <p>Ativar essa opção adiciona um ponto para cada cliente quando você conclui um agendamento.</p>
        </div>
        
        <button 
          className={`btn-toggle ${ativo ? 'ativo' : 'inativo'}`} 
          onClick={toggleFidelidade}
        >
          <Power size={20} />
          {ativo ? 'Fidelidade Ativada' : 'Fidelidade Desativada'}
        </button>
      </div>

      <div className="fidelidade-info card">
        <h4>Como funciona?</h4>
        <ul>
          <li>O cliente ganha 1 ponto a cada serviço concluído.</li>
          <li>Ao atingir 10 pontos, o cliente ganha um corte grátis.</li>
          <li><strong>Atenção:</strong> Se você desativar a fidelidade, os clientes param de ganhar novos pontos, mas <strong>NÃO PERDEM</strong> os pontos que já acumularam.</li>
        </ul>
      </div>
    </div>
  );
}