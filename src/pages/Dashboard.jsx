import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Calendar, DollarSign, Users, CheckCircle } from 'lucide-react';
// O CSS do dashboard já está no Layout.css, mas se você tiver um Dashboard.css, pode manter.

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState(null);

  // Verifica se o barbeiro está logado
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  // Puxa os agendamentos do Firebase em tempo real
  useEffect(() => {
    if (!user) return; // Só puxa se estiver logado

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

  // Função para marcar como concluído
  async function concluirAgendamento(id) {
    try {
      const agendamentoRef = doc(db, "agendamentos", id);
      await updateDoc(agendamentoRef, { status: 'concluido' });
    } catch (error) {
      console.error("Erro ao atualizar:", error);
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
              </div>
              <div className="valor">R$ {ag.preco},00</div>
              
              {ag.status === 'concluido' ? (
                <div style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                  <CheckCircle size={16} /> Concluído
                </div>
              ) : (
                <button 
                  className="btn-outline btn-small" 
                  onClick={() => concluirAgendamento(ag.id)}
                >
                  Concluir
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}