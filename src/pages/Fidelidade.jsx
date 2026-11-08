import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Award, Power, Save, Gift, Target } from 'lucide-react';
import './Fidelidade.css';

export default function Fidelidade() {
  const [ativo, setAtivo] = useState(false);
  const [pontosPorAtendimento, setPontosPorAtendimento] = useState(1);
  const [pontosParaPremio, setPontosParaPremio] = useState(10);
  const [descricaoPremio, setDescricaoPremio] = useState('Corte Grátis');
  
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
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
          setPontosPorAtendimento(data.pontosPorAtendimento || 1);
          setPontosParaPremio(data.pontosParaPremio || 10);
          setDescricaoPremio(data.descricaoPremio || 'Corte Grátis');
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

  async function salvarConfiguracoes(e) {
    e.preventDefault();
    if (!usuario) return;
    setSalvando(true);

    try {
      const docRef = doc(db, "barbearias", usuario.uid);
      await updateDoc(docRef, {
        pontosPorAtendimento: Number(pontosPorAtendimento),
        pontosParaPremio: Number(pontosParaPremio),
        descricaoPremio: descricaoPremio
      });
      alert("✅ Regras de fidelidade salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar as configurações.");
    } finally {
      setSalvando(false);
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
          <p>Ativar essa opção adiciona pontos para cada cliente quando você conclui um agendamento.</p>
        </div>
        
        <button 
          className={`btn-toggle ${ativo ? 'ativo' : 'inativo'}`} 
          onClick={toggleFidelidade}
        >
          <Power size={20} />
          {ativo ? 'Fidelidade Ativada' : 'Fidelidade Desativada'}
        </button>
      </div>

      {ativo && (
        <form className="fidelidade-config card" onSubmit={salvarConfiguracoes}>
          <h3>Configuração de Regras</h3>
          
          <div className="config-grid">
            <div className="input-group">
              <label><Target size={14} /> Pontos por Atendimento</label>
              <input 
                type="number" 
                min="1" 
                value={pontosPorAtendimento} 
                onChange={e => setPontosPorAtendimento(e.target.value)} 
                required
              />
              <span className="input-hint">Quantos pontos o cliente ganha ao concluir um serviço?</span>
            </div>

            <div className="input-group">
              <label><Gift size={14} /> Pontos para Ganhar o Prêmio</label>
              <input 
                type="number" 
                min="1" 
                value={pontosParaPremio} 
                onChange={e => setPontosParaPremio(e.target.value)} 
                required
              />
              <span className="input-hint">Quantos pontos o cliente precisa juntar?</span>
            </div>
          </div>

          <div className="input-group">
            <label>Descrição do Prêmio</label>
            <input 
              type="text" 
              value={descricaoPremio} 
              onChange={e => setDescricaoPremio(e.target.value)} 
              placeholder="Ex: Corte Grátis, 50% de desconto..."
              required
            />
            <span className="input-hint">O que o cliente ganha ao atingir a meta?</span>
          </div>

          <button type="submit" className="btn-primary full" disabled={salvando}>
            <Save size={18} /> {salvando ? 'Salvando...' : 'Salvar Regras'}
          </button>
        </form>
      )}

      <div className="fidelidade-info card">
        <h4>Como funciona?</h4>
        <ul>
          <li>O cliente ganha <strong>{pontosPorAtendimento} ponto(s)</strong> a cada serviço concluído.</li>
          <li>Ao atingir <strong>{pontosParaPremio} pontos</strong>, o cliente ganha: <strong>{descricaoPremio}</strong>.</li>
          <li><strong>Atenção:</strong> Se você desativar a fidelidade, os clientes param de ganhar novos pontos, mas <strong>NÃO PERDEM</strong> os pontos que já acumularam.</li>
        </ul>
      </div>
    </div>
  );
}