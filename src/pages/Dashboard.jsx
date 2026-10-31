import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Calendar, DollarSign, Users, CheckCircle, Award } from 'lucide-react';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState(null);
  const [fidelidadeAtiva, setFidelidadeAtiva] = useState(false);

  // Verifica se o barbeiro está logado
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Verifica se a loja tem a fidelidade ativada
  useEffect(() => {
    async function verificarFidelidade() {
      if (!user) return;
      try {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setFidelidadeAtiva(lojaSnap.data().fidelidadeAtiva || false);
        }
      } catch (error) {
        console.error("Erro ao verificar fidelidade:", error);
      }
    }
    verificarFidelidade();
  }, [user]);

  // Puxa os agendamentos
  useEffect(() => {
    if (!user) return; 

    const q = query(collection(db, "agendamentos"), orderBy("criadoEm", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setAgendamentos(lista);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function concluirAgendamento(id, clienteId) {
    try {
      // 1. Muda o status do agendamento para concluído
      const agendamentoRef = doc(db, "agendamentos", id);
      await updateDoc(agendamentoRef, { status: 'concluido' });

      // 2. Se a fidelidade estiver ativa, soma +1 ponto para o cliente
      if (fidelidadeAtiva && clienteId) {
        const clienteRef = doc(db, "clientes", clienteId);
        await updateDoc(clienteRef, { pontos: increment(1) });
        alert("Serviço concluído! O cliente ganhou 1 ponto de fidelidade.");
      } else {
        alert("Serviço concluído!");
      }
      
    } catch (error) {
      console.error("Erro ao atualizar:", error);
      alert("Erro ao concluir.");
    }
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2 style={{ color: 'var(--gold)' }}>Acesso Restrito</h2>
        <p>Você precisa estar logado para ver o painel.</p>
      </div>
    );
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Agenda de Hoje</h1>
          <p>Bem-vindo, {user.displayName || user.email}</p>
        </div>
        <div className="resumo-card">
          <span>Total de Agendamentos</span>
          <strong>{agendamentos.length}</strong>
        </div>
      </header>

      {carregando ? (
        <p style={{ color: 'var(--gold)' }}>Carregando agendamentos...</p>
      ) : agendamentos.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Nenhum agendamento encontrado ainda.</p>
      ) : (
        <div className="agenda-list">
          {agendamentos.map(ag => (
            <div key={ag.id} className="agenda-item card" style={{ opacity: ag.status === 'concluido' ? 0.6 : 1 }}>
              <div className="hora">{ag.horario}</div>
              <div className="detalhes">
                <h4>{ag.clienteNome}</h4>
                <p>{ag.servico} com {ag.barbeiroNome}</p>
                <p style={{ fontSize: '12px', color: 'var(--muted)' }}>Data: {ag.data}</p>
                
                {ag.clienteTelefone && (
                  <a 
                    href={`https://wa.me/55${ag.clienteTelefone.replace(/\D/g, '')}`} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#25D366', fontSize: '12px', marginTop: '5px', textDecoration: 'none', fontWeight: 'bold' }}
                  >
                    💬 Chamar no WhatsApp
                  </a>
                )}
              </div>
              <div className="valor">R$ {ag.preco},00</div>
              
              {ag.status === 'concluido' ? (
                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                  <CheckCircle size={16} /> Concluído
                </div>
              ) : (
                <button 
                  className="btn-outline btn-small" 
                  onClick={() => concluirAgendamento(ag.id, ag.clienteId)}
                >
                  {fidelidadeAtiva ? (
                    <><Award size={14} /> Concluir e Dar Ponto</>
                  ) : (
                    'Concluir'
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}