import { X, Clock, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc } from 'firebase/firestore';
import './BookingModal.css';

export default function BookingModal({ barber, onClose }) {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [user, setUser] = useState(null);
  const [salvando, setSalvando] = useState(false);

  // Verifica se o usuário está logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const services = [
    { id: 1, name: 'Corte Clássico', duration: 30, price: 60 },
    { id: 2, name: 'Corte + Barba', duration: 60, price: 100 },
    { id: 3, name: 'Barba Terapia', duration: 45, price: 70 },
    { id: 4, name: 'Degradê Premium', duration: 40, price: 80 },
  ];

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

    setSalvando(true);
    try {
      await addDoc(collection(db, "agendamentos"), {
        clienteId: auth.currentUser.uid,
        clienteNome: auth.currentUser.displayName || "Cliente sem nome",
        clienteEmail: auth.currentUser.email,
        barbeiroId: barber.id,
        barbeiroNome: barber.name,
        servico: selectedService.name,
        preco: selectedService.price,
        data: selectedDate.toLocaleDateString('pt-BR'),
        horario: selectedTime,
        status: 'confirmado',
        criadoEm: new Date()
      });

      alert(`✅ Agendamento confirmado com sucesso!`);
      onClose();
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert('Erro ao salvar o agendamento. Tente novamente.');
    } finally {
      setSalvando(false);
    }
  }

  // TRAVA DE SEGURANÇA: Se não estiver logado, impede o agendamento
  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}><X size={22} /></button>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <h2 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Quase lá!</h2>
            <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>
              Para agendar seu horário com {barber.name}, você precisa estar logado.
            </p>
            <button 
              className="btn-primary full" 
              onClick={() => { onClose(); }}
            >
              Fazer Login no topo da tela
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
            <div className="service-list">
              {services.map(s => (
                <div
                  key={s.id}
                  className={`service-item ${selectedService?.id === s.id ? 'selected' : ''}`}
                  onClick={() => setSelectedService(s)}
                >
                  <div>
                    <h4>{s.name}</h4>
                    <span className="duration"><Clock size={12} /> {s.duration} min</span>
                  </div>
                  <span className="price">R$ {s.price}</span>
                </div>
              ))}
            </div>
            <button
              className="btn-primary full"
              disabled={!selectedService}
              onClick={() => setStep(2)}
            >
              Continuar
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <h3 className="step-title">2. Escolha data e horário</h3>
            <div className="date-selector">
              {dates.map(d => (
                <button
                  key={d.toISOString()}
                  className={`date-btn ${selectedDate?.toDateString() === d.toDateString() ? 'active' : ''}`}
                  onClick={() => setSelectedDate(d)}
                >
                  <span className="day-name">
                    {d.toLocaleDateString('pt-BR', { weekday: 'short' })}
                  </span>
                  <span className="day-num">{d.getDate()}</span>
                </button>
              ))}
            </div>

            <div className="time-grid">
              {times.map(t => (
                <button
                  key={t}
                  className={`time-btn ${selectedTime === t ? 'active' : ''}`}
                  onClick={() => setSelectedTime(t)}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="button-row">
              <button className="btn-outline" onClick={() => setStep(1)}>Voltar</button>
              <button
                className="btn-primary"
                disabled={!selectedDate || !selectedTime}
                onClick={() => setStep(3)}
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h3 className="step-title">3. Confirmar agendamento</h3>
            <div className="summary">
              <div className="summary-row">
                <span>Barbeiro</span>
                <strong>{barber.name}</strong>
              </div>
              <div className="summary-row">
                <span>Serviço</span>
                <strong>{selectedService.name}</strong>
              </div>
              <div className="summary-row">
                <span>Data</span>
                <strong>{selectedDate.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' })}</strong>
              </div>
              <div className="summary-row">
                <span>Horário</span>
                <strong>{selectedTime}</strong>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <strong>R$ {selectedService.price},00</strong>
              </div>
            </div>

            <div className="button-row">
              <button className="btn-outline" onClick={() => setStep(2)}>Voltar</button>
              <button 
                className="btn-primary" 
                onClick={confirm}
                disabled={salvando}
              >
                {salvando ? 'Salvando...' : 'Confirmar e Pagar'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}