import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Calendar, Award, Star, LogOut } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './MinhaConta.css';

export default function MinhaConta() {
  const [usuario, setUsuario] = useState(undefined);
  const [agendamentos, setAgendamentos] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchDados() {
      if (!usuario) {
        setCarregando(false);
        return;
      }

      try {
        const clienteRef = doc(db, "clientes", usuario.uid);
        const clienteSnap = await getDoc(clienteRef);
        if (clienteSnap.exists()) {
          setPontos(clienteSnap.data().pontos || 0);
        }

        const q = query(collection(db, "agendamentos"), where("clienteId", "==", usuario.uid));
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        
        lista.sort((a, b) => new Date(b.criadoEm) - new Date(a.criadoEm));
        setAgendamentos(lista);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchDados();
  }, [usuario]);

  async function handleLogout() {
    await auth.signOut();
    navigate('/');
  }

  async function avaliarServico(agendamentoId, nota) {
    try {
      const agendamentoRef = doc(db, "agendamentos", agendamentoId);
      await updateDoc(agendamentoRef, { 
        avaliacao: nota,
        avaliadoEm: new Date()
      });
      
      // Atualiza a lista localmente para não precisar recarregar
      setAgendamentos(prev => prev.map(ag => 
        ag.id === agendamentoId ? { ...ag, avaliacao: nota } : ag
      ));
      
      alert(`⭐ Obrigado! Você avaliou com ${nota} estrelas.`);
    } catch (error) {
      console.error("Erro ao avaliar:", error);
      alert("Erro ao enviar avaliação.");
    }
  }

  if (carregando) return <p style={{ padding: '50px', textAlign: 'center', color: 'var(--primary)' }}>Carregando...</p>;
  if (!usuario) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: 'var(--primary)' }}>Faça login para ver sua conta</h2>
      <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Voltar para o Início</Link>
    </div>
  );

  const meta = 10;
  const pontosRestantes = meta - (pontos % meta);

  return (
    <div className="minha-conta-container">
      <header className="conta-header">
        <div className="avatar-user">
          {usuario.displayName ? usuario.displayName[0].toUpperCase() : 'C'}
        </div>
        <div>
          <h1>{usuario.displayName || 'Cliente'}</h1>
          <p>{usuario.email}</p>
        </div>
        <button className="btn-outline" onClick={handleLogout} style={{ marginLeft: 'auto' }}>
          <LogOut size={16} /> Sair
        </button>
      </header>

      <div className="conta-grid">
        {/* CARTÃO FIDELIDADE */}
        <div className="fidelidade-card card">
          <h3><Award size={20} color="var(--primary)" /> Meu Cartão Fidelidade</h3>
          <div className="pontos-display">
            <strong>{pontos}</strong>
            <span>pontos acumulados</span>
          </div>
          <div className="progresso-cortes">
            {[...Array(meta)].map((_, index) => (
              <div 
                key={index} 
                className={`corte-slot ${index < (pontos % meta) ? 'preenchido' : ''}`}
              >
                <Star size={16} />
              </div>
            ))}
          </div>
          <p className="aviso-pontos">
            {pontos > 0 && pontos % meta === 0 
              ? "🎉 Você ganhou um prêmio grátis!" 
              : `Faltam ${pontosRestantes} para ganhar um prêmio grátis!`}
          </p>
        </div>

        {/* HISTÓRICO DE AGENDAMENTOS */}
        <div className="historico-card card">
          <h3><Calendar size={20} color="var(--primary)" /> Meus Agendamentos</h3>
          
          {agendamentos.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Você ainda não fez nenhum agendamento.</p>
          ) : (
            <div className="historico-list">
              {agendamentos.map(ag => (
                <div key={ag.id} className="historico-item">
                  <div className="historico-info">
                    <h4>{ag.servico}</h4>
                    <p>{ag.barbeiroNome} • {ag.data} às {ag.horario}</p>
                  </div>
                  
                  {/* ÁREA DE AVALIAÇÃO */}
                  {ag.status === 'concluido' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {ag.avaliacao ? (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(estrela => (
                            <Star 
                              key={estrela} 
                              size={16} 
                              fill={estrela <= ag.avaliacao ? "var(--primary)" : "none"} 
                              color="var(--primary)" 
                            />
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(estrela => (
                            <button 
                              key={estrela} 
                              onClick={() => avaliarServico(ag.id, estrela)}
                              style={{ background: 'none', padding: 0, cursor: 'pointer' }}
                              title={`Avaliar com ${estrela} estrelas`}
                            >
                              <Star size={18} color="var(--border)" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className={`status-badge ${ag.status === 'concluido' ? 'ativo' : 'pendente'}`}>
                    {ag.status === 'concluido' ? 'Concluído' : 'Agendado'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}