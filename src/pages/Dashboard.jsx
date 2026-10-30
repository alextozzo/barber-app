import { useState } from 'react';

export default function Dashboard() {
  const [agendamentos, setAgendamentos] = useState([
    { id: 1, cliente: 'João Silva', servico: 'Corte Clássico', hora: '09:00', valor: 60 },
    { id: 2, cliente: 'Pedro Santos', servico: 'Corte + Barba', hora: '10:30', valor: 100 },
    { id: 3, cliente: 'Lucas Oliveira', servico: 'Degradê Premium', hora: '14:00', valor: 80 },
  ]);

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Agenda de Hoje</h1>
          <p>Quarta-feira, 04 de Novembro</p>
        </div>
        <div className="resumo-card">
          <span>Total Hoje</span>
          <strong>R$ 240,00</strong>
        </div>
      </header>

      <div className="agenda-list">
        {agendamentos.map(ag => (
          <div key={ag.id} className="agenda-item card">
            <div className="hora">{ag.hora}</div>
            <div className="detalhes">
              <h4>{ag.cliente}</h4>
              <p>{ag.servico}</p>
            </div>
            <div className="valor">R$ {ag.valor},00</div>
            <button className="btn-outline btn-small">Concluir</button>
          </div>
        ))}
      </div>
    </>
  );
}