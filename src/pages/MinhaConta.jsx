import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
import { Calendar, Star, LogOut, XCircle, Bell, Crown } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import './MinhaConta.css';

export default function MinhaConta() {
  const [usuario, setUsuario] = useState(undefined);
  const [agendamentos, setAgendamentos] = useState([]);
  const [pontos, setPontos] = useState(0);
  const [carregando, setCarregando] = useState(true);
  const [meta, setMeta] = useState(10);
  const [descricaoPremio, setDescricaoPremio] = useState('Prêmio Grátis');
  const [notificacoesAtivas, setNotificacoesAtivas] = useState(false);
  const [nomeLoja, setNomeLoja] = useState('Quero1Horario');

  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'granted') {
      setNotificacoesAtivas(true);
    }
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

        if (lista.length > 0) {
          const ultimoAgendamento = lista[0];
          const lojaRef = doc(db, "barbearias", ultimoAgendamento.barbeiroId);
          const lojaSnap = await getDoc(lojaRef);
          if (lojaSnap.exists()) {
            const dadosLoja = lojaSnap.data();
            setMeta(dadosLoja.pontosParaPremio || 10);
            setDescricaoPremio(dadosLoja.descricaoPremio || 'Prêmio Grátis');
            setNomeLoja(dadosLoja.nome || 'Quero1Horario');
          }
        }

      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchDados();
  }, [usuario]);

  async function ativarNotificacoes() {
    if (!('Notification' in window)) {
      alert("Seu navegador não suporta notificações.");
      return;
    }

    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      setNotificacoesAtivas(true);
      new Notification('🔔 Lembretes Ativados!', {
        body: 'Você será avisado 2 horas antes do seu agendamento.',
      });
    }
  }

  async function handleLogout() {
    await auth.signOut();
    navigate('/');
  }

  async function avaliarServico(agendamentoId, nota) {
    try {
      const agendamentoRef = doc(db, "agendamentos", agendamentoId);
      await updateDoc(agendamentoRef, { avaliacao: nota, avaliadoEm: new Date() });
      setAgendamentos(prev => prev.map(ag => ag.id === agendamentoId ? { ...ag, avaliacao: nota } : ag));
      alert(`⭐ Obrigado! Você avaliou com ${nota} estrelas.`);
    } catch (error) {
      console.error("Erro ao avaliar:", error);
    }
  }

  async function cancelarAgendamento(ag) {
    if (!window.confirm("Tem certeza que deseja cancelar este agendamento?")) return;

    try {
      const agendamentoRef = doc(db, "agendamentos", ag.id);
      await updateDoc(agendamentoRef, { status: 'cancelado' });
      setAgendamentos(prev => prev.map(a => a.id === ag.id ? { ...a, status: 'cancelado' } : a));
      alert("✅ Agendamento cancelado. O horário foi liberado.");
    } catch (error) {
      console.error("Erro ao cancelar:", error);
    }
  }

  if (carregando) return <p style={{ padding: '50px', textAlign: 'center', color: 'var(--primary)' }}>Carregando...</p>;
  if (!usuario) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: 'var(--primary)' }}>Faça login para ver sua conta</h2>
      <Link to="/" className="btn-primary" style={{ marginTop: '20px', display: 'inline-block' }}>Voltar para o Início</Link>
    </div>
  );

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

      {!notificacoesAtivas && (
        <div className="banner-notificacao">
          <div className="banner-notif-content">
            <Bell size={24} color="var(--primary)" />
            <div>
              <h4>Ative os lembretes</h4>
              <p>Seja avisado 2 horas antes do seu agendamento.</p>
            </div>
          </div>
          <button className="btn-primary" onClick={ativarNotificacoes} style={{ padding: '8px 16px', fontSize: '14px' }}>Ativar</button>
        </div>
      )}

      <div className="conta-grid">
        {/* CARTÃO BLACK PREMIUM */}
        <div className="cartao-black">
          <div className="cartao-header">
            <Crown size={20} color="#D4AF37" />
            <span className="cartao-loja">{nomeLoja}</span>
          </div>
          
          <div className="cartao-pontos">
            <strong>{pontos}</strong>
            <span>PONTOS ACUMULADOS</span>
          </div>
          
          <div className="cartao-progresso">
            {[...Array(meta)].map((_, index) => (
              <div key={index} className={`cartao-slot ${index < (pontos % meta) ? 'preenchido' : ''}`}>
                <Star size={12} />
              </div>
            ))}
          </div>
          
          <div className="cartao-footer">
            <p>Faltam <strong>{pontosRestantes}</strong> pontos para ganhar:</p>
            <h4>{descricaoPremio}</h4>
          </div>
        </div>

        {/* HISTÓRICO DE AGENDAMENTOS */}
        <div className="historico-card card">
          <h3><Calendar size={20} color="var(--primary)" /> Meus Agendamentos</h3>
          
          {agendamentos.length === 0 ? (
            <p style={{ color: 'var(--muted)' }}>Você ainda não fez nenhum agendamento.</p>
          ) : (
            <div className="historico-list">
              {agendamentos.map(ag => (
                <div key={ag.id} className="historico-item" style={{ opacity: ag.status === 'cancelado' ? 0.5 : 1 }}>
                  <div className="historico-info">
                    <h4>{ag.servico}</h4>
                    <p>{ag.barbeiroNome} • {ag.data} às {ag.horario}</p>
                  </div>
                  
                  {ag.status === 'concluido' && (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      {ag.avaliacao ? (
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1, 2, 3, 4, 5].map(estrela => (
                            <Star key={estrela} size={16} fill={estrela <= ag.avaliacao ? "var(--primary)" : "none"} color="var(--primary)" />
                          ))}
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '4px' }}>
                          {[1, 2, 3, 4, 5].map(estrela => (
                            <button key={estrela} onClick={() => avaliarServico(ag.id, estrela)} style={{ background: 'none', padding: 0, cursor: 'pointer' }}>
                              <Star size={18} color="var(--border)" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {ag.status !== 'concluido' && ag.status !== 'cancelado' && (
                    <button 
                      onClick={() => cancelarAgendamento(ag)}
                      style={{ background: 'none', color: '#ff6b6b', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(255, 107, 107, 0.3)', padding: '6px 12px', borderRadius: '6px' }}
                    >
                      <XCircle size={14} /> Cancelar
                    </button>
                  )}

                  <div className={`status-badge ${ag.status === 'concluido' ? 'ativo' : ag.status === 'cancelado' ? 'cancelado' : 'pendente'}`}>
                    {ag.status === 'concluido' ? 'Concluído' : ag.status === 'cancelado' ? 'Cancelado' : 'Agendado'}
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