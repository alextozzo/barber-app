import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Store, Mail, Phone, CheckCircle, XCircle, DollarSign, Trash2 } from 'lucide-react';
import './SuperAdmin.css';

export default function SuperAdmin() {
  const [barbearias, setBarbearias] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "barbearias"), (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setBarbearias(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  // --- MÉTRICAS DO DASHBOARD ---
  const totalLojas = barbearias.length;
  const lojasAtivas = barbearias.filter(b => b.statusPagamento === 'ativo').length;
  const lojasPendentes = barbearias.filter(b => b.statusPagamento !== 'ativo').length;
  
  // Faturamento estimado (soma dos planos, assumindo Básico se não tiver)
  const faturamentoEstimado = barbearias.reduce((acc, b) => {
    if (b.statusPagamento !== 'ativo') return acc;
    const precos = { basico: 29.90, pro: 49.90, premium: 79.90 };
    const plano = b.plano || 'basico'; // <-- Se não tiver plano, assume básico
    return acc + (precos[plano] || 0);
  }, 0);

  // --- AÇÕES ---
  async function aprovarPagamento(id) {
    try {
      await updateDoc(doc(db, "barbearias", id), { statusPagamento: 'ativo' });
    } catch (error) { console.error(error); }
  }

  async function bloquearLoja(id) {
    if (!window.confirm("Bloquear esta loja? O link ficará offline.")) return;
    try {
      await updateDoc(doc(db, "barbearias", id), { statusPagamento: 'pendente' });
    } catch (error) { console.error(error); }
  }

  async function removerLoja(id) {
    if (!window.confirm("ATENÇÃO: Isso apagará a loja permanentemente. Continuar?")) return;
    try {
      await deleteDoc(doc(db, "barbearias", id));
    } catch (error) { console.error(error); }
  }

  if (carregando) return <p style={{ padding: '40px', color: 'var(--muted)' }}>Carregando dashboard...</p>;

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Painel do Super Admin</h1>
        <p>Visão geral do seu negócio</p>
      </header>

      {/* KPI CARDS */}
      <div className="kpi-grid">
        <div className="kpi-card card">
          <div className="kpi-icon"><Store size={24} /></div>
          <div className="kpi-info">
            <span>Total de Lojas</span>
            <strong>{totalLojas}</strong>
          </div>
        </div>
        <div className="kpi-card card">
          <div className="kpi-icon" style={{ color: '#10B981' }}><CheckCircle size={24} /></div>
          <div className="kpi-info">
            <span>Lojas Ativas</span>
            <strong>{lojasAtivas}</strong>
          </div>
        </div>
        <div className="kpi-card card">
          <div className="kpi-icon" style={{ color: '#EF4444' }}><XCircle size={24} /></div>
          <div className="kpi-info">
            <span>Pendentes/Bloqueadas</span>
            <strong>{lojasPendentes}</strong>
          </div>
        </div>
        <div className="kpi-card card destaque">
          <div className="kpi-icon"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <span>Faturamento Estimado (Mês)</span>
            <strong>R$ {faturamentoEstimado.toFixed(2).replace('.', ',')}</strong>
          </div>
        </div>
      </div>

      {/* TABELA DE GESTÃO */}
      <div className="gestao-card card">
        <h3>Gestão de Lojas</h3>
        <div className="tabela-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Estabelecimento</th>
                <th>Dono / Contato</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {barbearias.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--muted)' }}>Nenhuma loja cadastrada.</td></tr>
              ) : (
                barbearias.map(b => (
                  <tr key={b.id}>
                    <td>
                      <div className="loja-nome">
                        <Store size={16} /> {b.nome || 'Sem nome'}
                      </div>
                    </td>
                    <td>
                      <div className="contato-info">
                        <span><Mail size={12} /> {b.donoEmail || b.email}</span>
                        {b.telefone && <span><Phone size={12} /> {b.telefone}</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`plano-badge ${b.plano || 'basico'}`}>
                        {b.plano || 'basico'}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${b.statusPagamento === 'ativo' ? 'ativo' : 'pendente'}`}>
                        {b.statusPagamento === 'ativo' ? 'Ativo' : 'Pendente'}
                      </span>
                    </td>
                    <td>
                      <div className="acoes-cell">
                        {b.statusPagamento !== 'ativo' ? (
                          <button className="btn-aprovar" onClick={() => aprovarPagamento(b.id)} title="Aprovar">
                            <CheckCircle size={16} />
                          </button>
                        ) : (
                          <button className="btn-bloquear" onClick={() => bloquearLoja(b.id)} title="Bloquear">
                            <XCircle size={16} />
                          </button>
                        )}
                        <button className="btn-delete" onClick={() => removerLoja(b.id)} title="Excluir">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}