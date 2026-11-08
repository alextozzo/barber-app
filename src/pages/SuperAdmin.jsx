import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { Store, Mail, Phone, CheckCircle, XCircle, DollarSign, Trash2, Clock } from 'lucide-react';
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
  
  // Considera ativo tanto quem você aprovou quanto quem pagou pelo Mercado Pago
  const lojasAtivas = barbearias.filter(b => b.statusPagamento === 'ativo' || b.statusPagamento === 'aprovado').length;
  
  // Pendentes incluem quem não pagou e quem clicou em "Já fiz o Pix"
  const lojasPendentes = barbearias.filter(b => b.statusPagamento !== 'ativo' && b.statusPagamento !== 'aprovado').length;
  
  const faturamentoEstimado = barbearias.reduce((acc, b) => {
    if (b.statusPagamento !== 'ativo' && b.statusPagamento !== 'aprovado') return acc;
    const precos = { basico: 29.90, pro: 49.90, premium: 79.90 };
    const plano = b.plano || 'basico';
    return acc + (precos[plano] || 0);
  }, 0);

  // --- AÇÕES ---
  async function aprovarPagamento(id) {
    try {
      // Calcula data de validade (+30 dias)
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + 30);

      await updateDoc(doc(db, "barbearias", id), { 
        statusPagamento: 'ativo',
        validadePlano: dataValidade.toISOString()
      });
      alert("✅ Loja aprovada! Validade de 30 dias definida.");
    } catch (error) { console.error(error); }
  }

  async function bloquearLoja(id) {
    if (!window.confirm("Bloquear esta loja? O acesso dela será suspenso.")) return;
    try {
      await updateDoc(doc(db, "barbearias", id), { statusPagamento: 'pendente' });
      alert("🚫 Loja bloqueada com sucesso.");
    } catch (error) { console.error(error); }
  }

  async function removerLoja(id) {
    if (!window.confirm("ATENÇÃO: Isso apagará a loja permanentemente. Tem certeza absoluta?")) return;
    try {
      await deleteDoc(doc(db, "barbearias", id));
      alert("🗑️ Loja removida.");
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
            <span>Aguardando Aprovação</span>
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
                      {/* Lógica de Status Visual */}
                      {(b.statusPagamento === 'ativo' || b.statusPagamento === 'aprovado') ? (
                        <span className="status-badge ativo">Ativo</span>
                      ) : b.statusPagamento === 'pendente_aprovacao' ? (
                        <span className="status-badge pendente" style={{ background: '#f59e0b', color: '#fff' }}>
                          <Clock size={12} style={{ marginRight: '4px' }} /> Em Análise
                        </span>
                      ) : (
                        <span className="status-badge pendente">Pendente</span>
                      )}
                    </td>
                    <td>
                      <div className="acoes-cell">
                        {(b.statusPagamento !== 'ativo' && b.statusPagamento !== 'aprovado') ? (
                          <button className="btn-aprovar" onClick={() => aprovarPagamento(b.id)} title="Aprovar e Ativar por 30 dias">
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