import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Calendar, CheckCircle, Award, Clock } from 'lucide-react';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState(null);
  const [fidelidadeAtiva, setFidelidadeAtiva] = useState(false);
  const [proximoCliente, setProximoCliente] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    async function verificarFidelidade() {
      if (!user) return;
      try {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setFidelidadeAtiva(lojaSnap.data().fidelidadeAtiva || false);
        }
      } catch (error) { console.error(error); }
    }
    verificarFidelidade();
  }, [user]);

  useEffect(() => {
    if (!user) return; 
    // Puxa os agendamentos e ordena por data de criação (mais recentes primeiro)
    const q = query(collection(db, "agendamentos"), orderBy("criadoEm", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setAgendamentos(lista);
      
      // Encontra o próximo cliente (primeiro pendente da lista)
      const proximo = lista.find(ag => ag.status !== 'concluido');
      setProximoCliente(proximo);
      
      setCarregando(false);
    });

    return () => unsubscribe();
  }, [user]);

  async function concluirAgendamento(id, clienteId) {
    try {
      const agendamentoRef = doc(db, "agendamentos", id);
      await updateDoc(agendamentoRef, { status: 'concluido' });

      if (fidelidadeAtiva && clienteId) {
        const clienteRef = doc(db, "clientes", clienteId);
        await updateDoc(clienteRef, { pontos: increment(1) });
        alert("Serviço concluído! O cliente ganhou 1 ponto de fidelidade.");
      } else {
        alert("Serviço concluído!");
      }
    } catch (error) {
      console.error(error);
      alert("Erro ao concluir.");
    }
  }

  // Saudação baseada na hora do dia
  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  if (carregando) return <p style={{ color: 'var(--primary)' }}>Carregando painel...</p>;
  if (!user) return <p>Faça login para acessar o painel.</p>;

  return (
    <div className="dashboard-wrapper">
      <header className="dashboard-header">
        <div>
          <h1>{saudacao}, {user.displayName ? user.displayName.split(' ')[0] : 'Profissional'}!</h1>
          <p>Aqui está o resumo da sua agenda.</p>
        </div>
        <div className="resumo-card destaque">
          <span>Faturamento Previsto</span>
          <strong>
            R$ {agendamentos.filter(a => a.status !== 'concluido').reduce((acc, a) => acc + a.preco, 0)},00
          </strong>
        </div>
      </header>

      {/* CARD DO PRÓXIMO CLIENTE (Destaque) */}
      {proximoCliente && (
        <div className="proximo-cliente-card">
          <div className="proximo-header">
            <Clock size={18} /> PRÓXIMO CLIENTE
          </div>
          <div className="proximo-body">
            <div>
              <h2>{proximoCliente.clienteNome}</h2>
              <p>{proximoCliente.servico} • {proximoCliente.horario}</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => concluirAgendamento(proximoCliente.id, proximoCliente.clienteId)}
            >
              Confirmar Atendimento
            </button>
          </div>
        </div>
      )}

      {/* LISTA DE AGENDAMENTOS */}
      <div className="agenda-list">
        <h3 style={{ color: 'var(--cream)', marginBottom: '16px', fontSize: '18px' }}>Todos os Agendamentos</h3>
        
        {agendamentos.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nenhum agendamento encontrado.</p>
        ) : (
          agendamentos.map(ag => (
            <div key={ag.id} className="agenda-item card" style={{ opacity: ag.status === 'concluido' ? 0.5 : 1 }}>
              <div className="hora">{ag.horario}</div>
              <div className="detalhes">
                <h4>{ag.clienteNome}</h4>
                <p>{ag.servico}</p>
              </div>
              <div className="valor">R$ {ag.preco},00</div>
              
              {ag.status === 'concluido' ? (
                <div style={{ color: 'var(--success)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle size={16} /> Concluído
                </div>
              ) : (
                <button className="btn-outline btn-small" onClick={() => concluirAgendamento(ag.id, ag.clienteId)}>
                  Concluir
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* ESTILOS INLINE DO DASHBOARD */}
      <style>{`
        .dashboard-wrapper { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
        
        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
        }
        .dashboard-header h1 { font-size: 32px; color: var(--cream); margin-bottom: 4px; }
        .dashboard-header p { color: var(--muted); }

        .resumo-card.destaque {
          background: var(--bg-card);
          border: 1px solid var(--primary);
          padding: 16px 24px;
          border-radius: 12px;
          text-align: right;
        }
        .resumo-card span { display: block; font-size: 12px; color: var(--muted); text-transform: uppercase; }
        .resumo-card strong { font-size: 24px; color: var(--primary); }

        .proximo-cliente-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, var(--bg-card) 100%);
          border: 1px solid var(--primary);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.1);
        }
        .proximo-header {
          display: flex;
          align-items: center;
          gap: 8px;
          color: var(--primary);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 16px;
        }
        .proximo-body {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .proximo-body h2 { font-size: 24px; color: var(--cream); margin-bottom: 4px; }
        .proximo-body p { color: var(--muted); font-size: 14px; }

        .agenda-item { display: flex; align-items: center; gap: 24px; padding: 20px; margin-bottom: 12px; }
        .agenda-item .hora { font-size: 18px; font-weight: 700; color: var(--primary); width: 60px; }
        .agenda-item .detalhes { flex: 1; }
        .agenda-item .detalhes h4 { font-size: 16px; color: var(--cream); margin-bottom: 4px; }
        .agenda-item .detalhes p { font-size: 13px; color: var(--muted); }
        .agenda-item .valor { font-weight: 600; color: var(--cream); margin-right: 20px; }

        @media (max-width: 768px) {
          .dashboard-header { flex-direction: column; align-items: flex-start; gap: 16px; }
          .proximo-body { flex-direction: column; align-items: flex-start; gap: 16px; }
          .agenda-item { flex-direction: column; align-items: flex-start; gap: 12px; }
          .agenda-item .valor { margin-right: 0; }
        }
      `}</style>
    </div>
  );
}