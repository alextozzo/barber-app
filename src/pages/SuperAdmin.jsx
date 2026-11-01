import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Store, Mail, Phone, CheckCircle, XCircle, DollarSign, Trash2 } from 'lucide-react';
import './SuperAdmin.css';

export default function SuperAdmin() {
  const [barbearias, setBarbearias] = useState([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "barbearias"), (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setBarbearias(lista);
    });
    return () => unsubscribe();
  }, []);

  // --- METRICAS DO DASHBOARD ---
  const totalLojas = barbearias.length;
  const lojasAtivas = barbearias.filter(b => b.statusPagamento === 'ativo').length;
  const lojasPendentes = barbearias.filter(b => b.statusPagamento !== 'ativo').length;
  
  // Calcula faturamento estimado (soma dos planos)
  const faturamentoEstimado = barbearias.reduce((acc, b) => {
    if (b.statusPagamento !== 'ativo') return acc;
    const precos = { basico: 29.90, pro: 49.90, premium: 79.90 };
    return acc + (precos[b.plano] || 0);
  }, 0);

  // --- ACOES ---
  async function aprovarPagamento(id) {
    try {
      await updateDoc(doc(db, "barbearias", id), { statusPagamento: 'ativo' });
    } catch (error) { console.error(error); }
  }

  async function bloquearLoja(id) {
    if (!window.confirm("Bloquear esta loja? O link ficara offline.")) return;
    try {
      await updateDoc(doc(db, "barbearias", id), { statusPagamento: 'pendente' });
    } catch (error) { console.error(error); }
  }

  async function removerLoja(id) {
    if (!window.confirm("ATENCAO: Isso apagara a loja permanentemente. Continuar?")) return;
    try {
      await deleteDoc(doc(db, "barbearias", id));
    } catch (error) { console.error(error); }
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Painel do Super Admin</h1>
        <p>Visao geral do seu negocio</p>
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
          <div className="kpi-icon" style={{ color: '#4A7C59' }}><CheckCircle size={24} /></div>
          <div className="kpi-info">
            <span>Lojas Ativas</span>
            <strong>{lojasAtivas}</strong>
          </div>
        </div>
        <div className="kpi-card card">
          <div className="kpi-icon" style={{ color: '#ff6b6b' }}><XCircle size={24} /></div>
          <div className="kpi-info">
            <span>Pendentes/Bloqueadas</span>
            <strong>{lojasPendentes}</strong>
          </div>
        </div>
        <div className="kpi-card card destaque">
          <div className="kpi-icon"><DollarSign size={24} /></div>
          <div className="kpi-info">
            <span>Faturamento Estimado (Mes)</span>
            <strong>R$ {faturamentoEstimado.toFixed(2).replace('.', ',')}</strong>
          </div>
        </div>
      </div>

      {/* TABELA DE GESTAO */}
      <div className="gestao-card card">
        <h3>Gestao de Lojas</h3>
        <div className="tabela-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Barbearia</th>
                <th>Dono / Contato</th>
                <th>Plano</th>
                <th>Status</th>
                <th>Acoes</th>
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
                      <span className={`plano-badge ${b.plano}`}>
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