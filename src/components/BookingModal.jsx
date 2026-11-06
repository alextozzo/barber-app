import { X, Clock, Check, Lock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, doc, getDoc, query, where, getDocs } from 'firebase/firestore';
import './BookingModal.css';

export default function BookingModal({ barber, onClose, onAskLogin }) {
  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  
  const [user, setUser] = useState(undefined); 
  const [salvando, setSalvando] = useState(false);
  const [carregandoServicos, setCarregandoServicos] = useState(true);
  const [horariosOcupados, setHorariosOcupados] = useState([]); 

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

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
          if (doc.data().status !== 'cancelado') {
            ocupados.push(doc.data().horario);
          }
        });
        setHorariosOcupados(ocupados);
      } catch (error) {
        console.error("Erro ao buscar horários:", error);
      }
    }
    buscarHorariosOcupados();
  }, [selectedDate, barber.id]);

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

  // FUNÇÃO NOVA: Busca o whats do barbeiro e abre o link
  async function enviarWhatsAppBarbeiro(nomeCliente, dataFormatada, hora, servico) {
    try {
      // Busca o documento do barbeiro na coleção "funcionarios"
      const barbeiroRef = doc(db, "funcionarios", barber.id.toString());
      const barbeiroSnap = await getDoc(barbeiroRef);

      if (barbeiroSnap.exists()) {
        const dadosBarbeiro = barbeiroSnap.data();
        const numeroWhats = dadosBarbeiro.whatsapp;

        if (numeroWhats) {
          // Monta a mensagem
          const mensagem = `Confirme sua agenda com *${barber.name}*.\n\n👤 *Cliente:* ${nomeCliente}\n✂️ *Serviço:* ${servico}\n📅 *Data:* ${dataFormatada}\n⏰ *Horário:* ${hora}\n\nOlá, gostaria de confirmar meu agendamento!`;

          // Limpa o número (remove espaços, traços, parênteses)
          const numeroLimpo = numeroWhats.replace(/\D/g, '');
          
          // Abre o WhatsApp do cliente com a mensagem pronta para o barbeiro (55 = Brasil)
          window.open(`https://wa.me/55${numeroLimpo}?text=${encodeURIComponent(mensagem)}`, '_blank');
        } else {
          console.warn("Barbeiro não tem WhatsApp cadastrado.");
        }
      }
    } catch (error) {
      console.error("Erro ao buscar WhatsApp do barbeiro:", error);
    }
  }

  async function confirm() {
    if (!auth.currentUser) {
      alert('⚠️ Você precisa estar logado para agendar!');
      return;
    }

    if (horariosOcupados.includes(selectedTime)) {
      alert('⚠️ Este horário acabou de ser ocupado por outra pessoa. Escolha outro.');
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

      const dataFormatada = selectedDate.toLocaleDateString('pt-BR');
      const nomeCliente = auth.currentUser.displayName || "Cliente";

      // 1. Salva no banco de dados
      await addDoc(collection(db, "agendamentos"), {
        clienteId: auth.currentUser.uid,
        clienteNome: nomeCliente,
        clienteEmail: auth.currentUser.email,
        clienteTelefone: telefoneCliente,
        barbeiroId: barber.id,
        barbeiroNome: barber.name,
        servico: selectedService.nome,
        preco: selectedService.preco,
        data: dataFormatada,
        horario: selectedTime,
        status: 'pagamento_pendente',
        criadoEm: new Date()
      });

      // 2. Notificação do navegador (se permitido)
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('🔔 Novo Agendamento!', {
          body: `${nomeCliente} agendou ${selectedService.nome} para ${dataFormatada} às ${selectedTime}.`,
          icon: barber.photo || '/vite.svg'
        });
      }

      // 3. Abre o WhatsApp do barbeiro com a mensagem de confirmação
      await enviarWhatsAppBarbeiro(nomeCliente, dataFormatada, selectedTime, selectedService.nome);

      // 4. Avisa o cliente e fecha
      alert(`✅ Agendamento realizado!\n\nO WhatsApp foi aberto. Por favor, envie a mensagem para o profissional confirmar.`);
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={22} /></button>

        <header className="modal-header">
          <h2>Agendar com {barber.name}</h2>
          <p>Olá, {user.displayName || user.email}!</p>
        </header>

        <div className="steps">
          {[1, 2, 3].map(n => (
            <div key={n} className={`step-dot ${step >= n ? 'active' : ''}`}>
              {step > n ? <Check size={14} /> : n}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div>
            <h3 className="step-title">1. Escolha o serviço</h3>
            
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
            
            <button className="btn-primary full" disabled={!selectedService} onClick={() => setStep(2)}>Continuar</button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="step-title">2. Escolha data e horário</h3>
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
              <button className="btn-outline" onClick={() => setStep(1)}>Voltar</button>
              <button className="btn-primary" disabled={!selectedDate || !selectedTime || horariosOcupados.includes(selectedTime)} onClick={() => setStep(3)}>Continuar</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="step-title">3. Confirmar agendamento</h3>
            <div className="summary">
              <div className="summary-row"><span>Profissional</span><strong>{barber.name}</strong></div>
              <div className="summary-row"><span>Serviço</span><strong>{selectedService.nome}</strong></div>
              <div className="summary-row"><span>Data</span><strong>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</strong></div>
              <div className="summary-row"><span>Horário</span><strong>{selectedTime}</strong></div>
              <div className="summary-row total"><span>Total</span><strong>R$ {selectedService.preco},00</strong></div>
            </div>
            
            <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '16px', textAlign: 'center' }}>
              Se preferir, realize o pagamento antecipado via Pix para a chave do profissional. Caso contrário, pague no local.
            </p>

            <div className="button-row">
              <button className="btn-outline" onClick={() => setStep(2)}>Voltar</button>
              <button className="btn-primary" onClick={confirm} disabled={salvando}>
                {salvando ? 'Salvando...' : 'Confirmar Agendamento'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}