import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { DollarSign, Calendar, TrendingUp, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Financeiro.css';

export default function Financeiro() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [plano, setPlano] = useState('basico');
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setPlano(lojaSnap.data().plano || 'basico');
        }

        // Puxa os agendamentos concluídos do barbeiro
        const q = query(
          collection(db, "agendamentos"), 
          where("barbeiroId", "==", user.uid),
          where("status", "==", "concluido")
        );
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setAgendamentos(lista);
      }
      setCarregando(false);
    });
    return () => unsubscribeAuth();
  }, []);

  if (carregando) return <p style={{ padding: '40px', color: 'var(--muted)' }}>Carregando...</p>;

  // Trava de Plano: Básico não tem acesso
  if (plano === 'basico') {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--cream)' }}>Recurso Exclusivo Pro/Premium</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>O relatório de faturamento está disponível nos planos Pro e Premium.</p>
        <Link to="/planos" className="btn-primary">Fazer Upgrade</Link>
      </div>
    );
  }

  // Calcula o faturamento total
  const faturamentoTotal = agendamentos.reduce((acc, ag) => acc + ag.preco, 0);
  const ticketMedio = agendamentos.length > 0 ? faturamentoTotal / agendamentos.length : 0;

  return (
    <div className="financeiro-container">
      <header className="financeiro-header">
        <h1>Relatório Financeiro</h1>
        <p>Acompanhe o desempenho do seu negócio.</p>
      </header>

      <div className="kpi-grid">
        <div className="kpi-card card destaque">
          <div className="kpi-icon"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <span>Faturamento Total</span>
            <strong>R$ {faturamentoTotal.toFixed(2).replace('.', ',')}</strong>
          </div>
        </div>
        <div className="kpi-card card">
          <div className="kpi-icon"><Calendar size={24} /></div>
          <div className="kpi-info">
            <span>Atendimentos Concluídos</span>
            <strong>{agendamentos.length}</strong>
          </div>
        </div>
        <div className="kpi-card card">
          <div className="kpi-icon"><TrendingUp size={24} /></div>
          <div className="kpi-info">
            <span>Ticket Médio</span>
            <strong>R$ {ticketMedio.toFixed(2).replace('.', ',')}</strong>
          </div>
        </div>
      </div>

      <div className="historico-financeiro card">
        <h3>Histórico de Serviços Concluídos</h3>
        {agendamentos.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nenhum serviço concluído ainda.</p>
        ) : (
          <div className="tabela-container">
            <table className="tabela-financeiro">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Valor</th>
                </tr>
              </thead>
              <tbody>
                {agendamentos.map(ag => (
                  <tr key={ag.id}>
                    <td>{ag.data}</td>
                    <td>{ag.clienteNome}</td>
                    <td>{ag.servico}</td>
                    <td style={{ color: 'var(--success)', fontWeight: 'bold' }}>R$ {ag.preco},00</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}