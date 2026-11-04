import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, query, orderBy, doc, updateDoc, getDoc, increment } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Calendar, CheckCircle, Clock, Lock, TrendingUp, DollarSign, Bell, X, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [user, setUser] = useState(null);
  const [plano, setPlano] = useState('basico');
  const [fidelidadeAtiva, setFidelidadeAtiva] = useState(false);
  const [proximoCliente, setProximoCliente] = useState(null);
  const [mostrarBannerNotificacao, setMostrarBannerNotificacao] = useState(false);
  const [slugLoja, setSlugLoja] = useState('');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      setMostrarBannerNotificacao(true);
    }
  }, []);

  async function ativarNotificacoes() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setMostrarBannerNotificacao(false);
        new Notification('🔔 Notificações Ativadas!', {
          body: 'Você será avisado quando um cliente agendar.',
        });
      } else {
        setMostrarBannerNotificacao(false);
      }
    }
  }

  useEffect(() => {
    async function verificarLoja() {
      if (!user) return;
      try {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          const data = lojaSnap.data();
          setPlano(data.plano || 'basico');
          setFidelidadeAtiva(data.fidelidadeAtiva || false);
          setSlugLoja(data.slug || '');
        }
      } catch (error) { console.error(error); }
    }
    verificarLoja();
  }, [user]);

  useEffect(() => {
    if (!user) return; 
    const q = query(collection(db, "agendamentos"), orderBy("criadoEm", "desc"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setAgendamentos(lista);
      
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
      }
    } catch (error) {
      console.error(error);
    }
  }

  // --- CÁLCULOS DE FATURAMENTO (MÊS ATUAL) ---
  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  const agendamentosDoMes = agendamentos.filter(ag => {
    if (!ag.data) return false;
    const [dia, mes, ano] = ag.data.split('/');
    return Number(mes) - 1 === mesAtual && Number(ano) === anoAtual;
  });

  const faturamentoPrevisto = agendamentosDoMes
    .filter(a => a.status !== 'concluido')
    .reduce((acc, a) => acc + a.preco, 0);

  const faturamentoRealizado = agendamentosDoMes
    .filter(a => a.status === 'concluido')
    .reduce((acc, a) => acc + a.preco, 0);

  // Histórico de 6 meses
  const historicoMeses = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mes = d.getMonth();
    const ano = d.getFullYear();
    
    const totalMes = agendamentos
      .filter(ag => {
        if (!ag.data) return false;
        const [dia, mesStr, anoStr] = ag.data.split('/');
        return Number(mesStr) - 1 === mes && Number(anoStr) === ano && ag.status === 'concluido';
      })
      .reduce((acc, a) => acc + a.preco, 0);

    historicoMeses.push({
      mes: d.toLocaleDateString('pt-BR', { month: 'short' }),
      total: totalMes
    });
  }
  const maxFaturamento = Math.max(...historicoMeses.map(h => h.total), 1);

  if (carregando) return <p style={{ color: 'var(--primary)' }}>Carregando painel...</p>;
  if (!user) return <p>Faça login para acessar o painel.</p>;

  const hora = new Date().getHours();
  const saudacao = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="dashboard-wrapper">
      {mostrarBannerNotificacao && (
        <div className="banner-notificacao card">
          <div className="banner-notif-content">
            <Bell size={24} color="var(--primary)" />
            <div>
              <h4>Ative as notificações</h4>
              <p>Seja avisado quando um cliente agendar, mesmo com o app fechado.</p>
            </div>
          </div>
          <div className="banner-notif-actions">
            <button className="btn-primary" onClick={ativarNotificacoes}>Ativar</button>
            <button className="btn-close-banner" onClick={() => setMostrarBannerNotificacao(false)}>
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* CARD DE DIVULGAÇÃO DO LINK */}
      {slugLoja && (
        <div className="card" style={{ padding: '24px', marginBottom: '24px', borderColor: 'var(--primary)' }}>
          <h3 style={{ color: 'var(--primary)', marginBottom: '8px' }}>Sua agenda está pronta! 🎉</h3>
          <p style={{ color: 'var(--muted)', fontSize: '14px', marginBottom: '16px' }}>
            Copie o link abaixo e coloque na bio do seu Instagram para receber agendamentos.
          </p>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <code style={{ 
              background: 'rgba(0,0,0,0.3)', 
              padding: '10px 16px', 
              borderRadius: '6px', 
              color: 'var(--primary)',
              fontSize: '14px',
              flex: 1,
              minWidth: '200px'
            }}>
              aplicativo-de-barbearia-sandy.vercel.app/{slugLoja}
            </code>
            <button 
              className="btn-primary" 
              onClick={() => {
                navigator.clipboard.writeText(`https://aplicativo-de-barbearia-sandy.vercel.app/${slugLoja}`);
                alert('Link copiado!');
              }}
            >
              <LinkIcon size={16} style={{ marginRight: '8px' }} /> Copiar Link
            </button>
          </div>
        </div>
      )}

      <header className="dashboard-header">
        <div>
          <h1>{saudacao}, {user.displayName ? user.displayName.split(' ')[0] : 'Profissional'}!</h1>
          <p>Aqui está o resumo do seu negócio.</p>
        </div>
      </header>

      {/* CARDS DE FATURAMENTO */}
      <div className="faturamento-grid">
        <div className="faturamento-card card">
          <div className="faturamento-icon"><DollarSign size={24} /></div>
          <div>
            <span>Faturamento Previsto (Mês)</span>
            <strong>R$ {faturamentoPrevisto.toFixed(2).replace('.', ',')}</strong>
          </div>
        </div>
        <div className="faturamento-card card destaque">
          <div className="faturamento-icon"><TrendingUp size={24} /></div>
          <div>
            <span>Faturamento Realizado (Mês)</span>
            <strong>R$ {faturamentoRealizado.toFixed(2).replace('.', ',')}</strong>
          </div>
        </div>
      </div>

      {/* GRÁFICO DE HISTÓRICO (SÓ PRO E PREMIUM) */}
      {plano === 'basico' ? (
        <div className="bloqueio-pro card">
          <Lock size={32} color="var(--primary)" />
          <h3>Histórico de Faturamento</h3>
          <p>Veja a evolução do seu negócio mês a mês. Disponível nos planos Pro e Premium.</p>
          <Link to="/planos" className="btn-primary">Fazer Upgrade</Link>
        </div>
      ) : (
        <div className="historico-grafico card">
          <h3>Evolução dos Últimos 6 Meses</h3>
          <div className="grafico-barras">
            {historicoMeses.map((item, index) => (
              <div key={index} className="barra-container">
                <div 
                  className="barra" 
                  style={{ height: `${(item.total / maxFaturamento) * 100}%` }}
                >
                  <span className="barra-valor">R$ {item.total},00</span>
                </div>
                <span className="barra-mes">{item.mes}</span>
              </div>
            ))}
          </div>
        </div>
      )}

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

      <div className="agenda-list">
        <h3 style={{ color: 'var(--cream)', marginBottom: '16px', fontSize: '18px' }}>Agendamentos Recentes</h3>
        {agendamentos.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Nenhum agendamento encontrado.</p>
        ) : (
          agendamentos.slice(0, 10).map(ag => (
            <div key={ag.id} className="agenda-item card" style={{ opacity: ag.status === 'concluido' ? 0.5 : 1 }}>
              <div className="hora">{ag.horario}</div>
              <div className="detalhes">
                <h4>{ag.clienteNome}</h4>
                <p>{ag.servico} • {ag.data}</p>
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

      <style>{`
        .dashboard-wrapper { max-width: 1000px; margin: 0 auto; padding: 40px 24px; }
        
        .banner-notificacao {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 24px;
          margin-bottom: 32px;
          border-color: var(--primary);
          background: rgba(59, 130, 246, 0.05);
        }
        .banner-notif-content { display: flex; align-items: center; gap: 16px; }
        .banner-notif-content h4 { font-size: 16px; color: var(--cream); margin-bottom: 4px; }
        .banner-notif-content p { font-size: 13px; color: var(--muted); }
        .banner-notif-actions { display: flex; align-items: center; gap: 12px; }
        .btn-close-banner { background: none; color: var(--muted); padding: 4px; }
        .btn-close-banner:hover { color: var(--danger); }

        .dashboard-header { margin-bottom: 32px; }
        .dashboard-header h1 { font-size: 32px; color: var(--cream); margin-bottom: 4px; }
        .dashboard-header p { color: var(--muted); }

        .faturamento-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 32px;
        }
        .faturamento-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
        }
        .faturamento-card.destaque {
          border-color: var(--primary);
          background: linear-gradient(135deg, var(--bg-card) 0%, rgba(59, 130, 246, 0.1) 100%);
        }
        .faturamento-icon {
          width: 48px;
          height: 48px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--primary);
        }
        .faturamento-card span {
          display: block;
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .faturamento-card strong {
          font-size: 24px;
          color: var(--cream);
        }

        .bloqueio-pro {
          text-align: center;
          padding: 40px;
          margin-bottom: 32px;
        }
        .bloqueio-pro h3 { color: var(--cream); margin: 16px 0 8px; }
        .bloqueio-pro p { color: var(--muted); margin-bottom: 20px; }

        .historico-grafico {
          padding: 32px;
          margin-bottom: 32px;
        }
        .historico-grafico h3 { color: var(--cream); margin-bottom: 24px; }
        .grafico-barras {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 200px;
          gap: 12px;
        }
        .barra-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          height: 100%;
          justify-content: flex-end;
        }
        .barra {
          width: 100%;
          background: var(--primary);
          border-radius: 6px 6px 0 0;
          position: relative;
          min-height: 4px;
          transition: height 0.3s ease;
        }
        .barra-valor {
          position: absolute;
          top: -20px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 10px;
          color: var(--muted);
          white-space: nowrap;
        }
        .barra-mes {
          margin-top: 8px;
          font-size: 12px;
          color: var(--muted);
          text-transform: uppercase;
        }

        .proximo-cliente-card {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, var(--bg-card) 100%);
          border: 1px solid var(--primary);
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 40px;
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
        .proximo-body { display: flex; justify-content: space-between; align-items: center; }
        .proximo-body h2 { font-size: 24px; color: var(--cream); margin-bottom: 4px; }
        .proximo-body p { color: var(--muted); font-size: 14px; }

        .agenda-item { display: flex; align-items: center; gap: 24px; padding: 20px; margin-bottom: 12px; }
        .agenda-item .hora { font-size: 18px; font-weight: 700; color: var(--primary); width: 60px; }
        .agenda-item .detalhes { flex: 1; }
        .agenda-item .detalhes h4 { font-size: 16px; color: var(--cream); margin-bottom: 4px; }
        .agenda-item .detalhes p { font-size: 13px; color: var(--muted); }
        .agenda-item .valor { font-weight: 600; color: var(--cream); margin-right: 20px; }

        @media (max-width: 768px) {
          .faturamento-grid { grid-template-columns: 1fr; }
          .banner-notificacao { flex-direction: column; align-items: flex-start; gap: 12px; }
          .proximo-body { flex-direction: column; align-items: flex-start; gap: 16px; }
          .agenda-item { flex-direction: column; align-items: flex-start; gap: 12px; }
        }
      `}</style>
    </div>
  );
}