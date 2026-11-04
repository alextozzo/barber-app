import { X, Clock, Check, Lock, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import './BookingModal.css';

export default function BookingModal({ barber, onClose, onAskLogin }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [equipe, setEquipe] = useState([]);
  const [selectedProfessional, setSelectedProfessional] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [user, setUser] = useState(undefined); 
  const [salvando, setSalvando] = useState(false);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [carregandoEquipe, setCarregandoEquipe] = useState(true);
  const [horariosOcupados, setHorariosOcupados] = useState([]); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Busca os serviços do profissional
  useEffect(() => {
    async function fetchServicos() {
      if (!barber.id) return;
      try {
        const q = query(collection(db, "servicos"), where("barbeiroId", "==", barber.id.toString()));
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setServices(lista);
      } catch (error) {
        console.error("Erro ao buscar serviços:", error);
      } finally {
        setCarregandoServicos(false);
      }
    }
    fetchServicos();
  }, [barber.id]);

  // Busca a equipe da loja (se houver)
  useEffect(() => {
    async function fetchEquipe() {
      if (!barber.id) return;
      try {
        const q = query(collection(db, "funcionarios"), where("lojaId", "==", barber.id));
        const querySnapshot = await getDocs(q);
        const lista = [];
        querySnapshot.forEach((doc) => {
          lista.push({ id: doc.id, ...doc.data() });
        });
        setEquipe(lista);
      } catch (error) {
        console.error("Erro ao buscar equipe:", error);
      } finally {
        setCarregandoEquipe(false);
      }
    }
    fetchEquipe();
  }, [barber.id]);

  // Busca horários ocupados (filtrados pelo profissional escolhido)
  useEffect(() => {
    async function buscarHorariosOcupados() {
      if (!selectedDate || !barber.id) return;

      const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
      
      try {
        const q = query(
          collection(db, "agendamentos"), 
          where("barbeiroId", "==", barber.id.toString()),
          where("data", "==", dataFormatada)
        );
        
        const querySnapshot = await getDocs(q);
        const ocupados = [];
        querySnapshot.forEach((doc) => {
          const agendamento = doc.data();
          // Se tiver um profissional selecionado, só bloqueia os horários dele
          if (selectedProfessional) {
            if (agendamento.profissionalId === selectedProfessional.id && agendamento.status !== 'cancelado') {
              ocupados.push(agendamento.horario);
            }
          } else {
            // Se não tiver profissional, bloqueia todos os horários da loja (comportamento antigo)
            if (agendamento.status !== 'cancelado') {
              ocupados.push(agendamento.horario);
            }
          }
        });
        setHorariosOcupados(ocupados);
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    }
    buscarHorariosOcupados();
  }, [selectedDate, barber.id, selectedProfessional]);

  const dates = generateDates();
  const times = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'];

  function generateDates() {
    const arr = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }

  async function confirm() {
    if (!auth.currentUser) {
      alert('⚠️ Você precisa estar logado para agendar!');
      return;
    }

    if (horariosOcupados.includes(selectedTime)) {
      alert('⚠️ Este horário acabou de ser ocupado. Escolha outro.');
      setStep(2);
      return;
    }

    setSalvando(true);
    try {
      const clienteRef = doc(db, "clientes", auth.currentUser.uid);
      const clienteSnap = await getDoc(clienteRef);
      
      let telefoneCliente = "";
      if (clienteSnap.exists()) {
        telefoneCliente = clienteSnap.data().telefone;
      }

      await addDoc(collection(db, "agendamentos"), {
        clienteId: auth.currentUser.uid,
        clienteNome: auth.currentUser.displayName || "Cliente",
        clienteEmail: auth.currentUser.email,
        clienteTelefone: telefoneCliente,
        barbeiroId: barber.id,
        barbeiroNome: barber.name,
        profissionalId: selectedProfessional ? selectedProfessional.id : barber.id,
        profissionalNome: selectedProfessional ? selectedProfessional.nome : barber.name,
        servico: selectedService.nome,
        preco: selectedService.preco,
        data: selectedDate.toLocaleDateString('pt-BR'),
        horario: selectedTime,
        status: 'pagamento_pendente',
        criadoEm: new Date()
      });

      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Novo Agendamento!', {
          body: `${auth.currentUser.displayName} agendou ${selectedService.nome} para ${selectedDate.toLocaleDateString('pt-BR')} às ${selectedTime}.`,
          icon: barber.photo || '/vite.svg'
        });
      }

      alert(`✅ Agendamento realizado!`);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar o agendamento. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  if (user === undefined) {
    return (
      <div className="modal-overlay">
        <div className="modal-content" style={{ textAlign: 'center', padding: '50px' }}>
          <p>Verificando login...</p>
        </div>
      </div>
    );
  }

  if (user === null) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
          <div style={{ textAlign: 'center', padding: '30px 10px' }}>
            <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
            <h2 style={{ color: 'var(--cream)', marginBottom: '10px' }}>Acesso Restrito</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>
              Para agendar seu horário com <strong>{barber.name}</strong>, você precisa entrar na sua conta.
            </p>
            <button className="btn-primary full" onClick={() => { onClose(); if(onAskLogin) onAskLogin(); }}>
              Fazer Login Agora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Define os passos dinamicamente (com ou sem escolha de profissional)
  const temEquipe = equipe.length > 0;
  const totalPassos = temEquipe ? 4 : 3;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={22} /></button>

        <header className="modal-header">
          <h2>Agendar com {barber.name}</h2>
          <p>Olá, {user.displayName || user.email}!</p>
        </header>

        <div className="steps">
          {Array.from({ length: totalPassos }, (_, i) => i + 1).map(n => (
            <div key={n} className={`step-dot ${step >= n ? 'active' : ''}`}>
              {step > n ? <Check size={14} /> : n}
            </div>
          ))}
        </div>

        {/* PASSO 1: ESCOLHER PROFISSIONAL (SÓ SE TIVER EQUIPE) */}
        {temEquipe && step === 1 && (
          <div>
            <h3 className="step-title">1. Escolha o profissional</h3>
            
            {carregandoEquipe ? (
              <p style={{ color: 'var(--muted)' }}>Carregando profissionais...</p>
            ) : (
              <div className="service-list">
                {equipe.map(prof => (
                  <div 
                    key={prof.id} 
                    className={`service-item ${selectedProfessional?.id === prof.id ? 'selected' : ''}`} 
                    onClick={() => setSelectedProfessional(prof)}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div className="equipe-avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', overflow: 'hidden', background: 'var(--border)' }}>
                        {prof.fotoUrl ? (
                          <img src={prof.fotoUrl} alt={prof.nome} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <User size={20} style={{ margin: '10px' }} />
                        )}
                      </div>
                      <div>
                        <h4>{prof.nome}</h4>
                        <span className="duration">{prof.especialidade || 'Barbeiro'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <button 
              className="btn-primary full" 
              disabled={!selectedProfessional} 
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}

        {/* PASSO 2 (OU 1 SE NÃO TIVER EQUIPE): ESCOLHER SERVIÇO */}
        {((!temEquipe && step === 1) || (temEquipe && step === 2)) && (
          <div>
            <h3 className="step-title">{temEquipe ? '2' : '1'}. Escolha o serviço</h3>
            
            {carregandoServicos ? (
              <p style={{ color: 'var(--muted)' }}>Carregando serviços...</p>
            ) : services.length === 0 ? (
              <p style={{ color: 'var(--danger)' }}>Este profissional ainda não cadastrou serviços.</p>
            ) : (
              <div className="service-list">
                {services.map(s => (
                  <div key={s.id} className={`service-item ${selectedService?.id === s.id ? 'selected' : ''}`} onClick={() => setSelectedService(s)}>
                    <div>
                      <h4>{s.nome}</h4>
                      <span className="duration"><Clock size={12} /> {s.duracao} min</span>
                    </div>
                    <span className="price">R$ {s.preco}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="button-row">
              {temEquipe && (
                <button className="btn-outline" onClick={() => setStep(1)}>Voltar</button>
              )}
              <button 
                className="btn-primary" 
                disabled={!selectedService} 
                onClick={() => setStep(temEquipe ? 3 : 2)}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASSO 3 (OU 2): ESCOLHER DATA E HORÁRIO */}
        {((!temEquipe && step === 2) || (temEquipe && step === 3)) && (
          <div>
            <h3 className="step-title">{temEquipe ? '3' : '2'}. Escolha data e horário</h3>
            <div className="date-selector">
              {dates.map(d => (
                <button key={d.toISOString()} className={`date-btn ${selectedDate?.toDateString() === d.toDateString() ? 'active' : ''}`} onClick={() => setSelectedDate(d)}>
                  <span className="day-name">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                  <span className="day-num">{d.getDate()}</span>
                </button>
              ))}
            </div>
            <div className="time-grid">
              {times.map(t => {
                const isOcupado = horariosOcupados.includes(t);
                return (
                  <button 
                    key={t} 
                    className={`time-btn ${selectedTime === t ? 'active' : ''}`} 
                    onClick={() => setSelectedTime(t)}
                    disabled={isOcupado}
                    style={isOcupado ? { opacity: 0.3, textDecoration: 'line-through', cursor: 'not-allowed' } : {}}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
            <div className="button-row">
              <button className="btn-outline" onClick={() => setStep(temEquipe ? 2 : 1)}>Voltar</button>
              <button className="btn-primary" disabled={!selectedDate || !selectedTime || horariosOcupados.includes(selectedTime)} onClick={() => setStep(temEquipe ? 4 : 3)}>Continuar</button>
            </div>
          </div>
        )}

        {/* PASSO 4 (OU 3): CONFIRMAR */}
        {((!temEquipe && step === 3) || (temEquipe && step === 4)) && (
          <div>
            <h3 className="step-title">{temEquipe ? '4' : '3'}. Confirmar agendamento</h3>
            <div className="summary">
              {temEquipe && (
                <div className="summary-row"><span>Profissional</span><strong>{selectedProfessional.nome}</strong></div>
              )}
              <div className="summary-row"><span>Estabelecimento</span><strong>{barber.name}</strong></div>
              <div className="summary-row"><span>Serviço</span><strong>{selectedService.nome}</strong></div>
              <div className="summary-row"><span>Data</span><strong>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</strong></div>
              <div className="summary-row"><span>Horário</span><strong>{selectedTime}</strong></div>
              <div className="summary-row total"><span>Total</span><strong>R$ {selectedService.preco},00</strong></div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', textAlign: 'center' }}>
              Faça o Pix para a chave do profissional e clique em <strong>"Já Paguei"</strong>.
            </p>

            <div className="button-row">
              <button className="btn-outline" onClick={() => setStep(temEquipe ? 3 : 2)}>Voltar</button>
              <button className="btn-primary" onClick={confirm} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Já Paguei e Confirmar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}