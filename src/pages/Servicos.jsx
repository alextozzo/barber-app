import { useState } from 'react';
import { Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import './Servicos.css';

export default function Servicos() {
  const [servicos, setServicos] = useState([
    { id: 1, nome: 'Corte Clássico', duracao: 30, preco: 60 },
    { id: 2, nome: 'Corte + Barba', duracao: 60, preco: 100 },
  ]);

  const [novoNome, setNovoNome] = useState('');
  const [novaDuracao, setNovaDuracao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');

  function adicionarServico(e) {
    e.preventDefault();
    if (!novoNome || !novaDuracao || !novoPreco) return;

    const novo = {
      id: Date.now(),
      nome: novoNome,
      duracao: Number(novaDuracao),
      preco: Number(novoPreco),
    };

    setServicos([...servicos, novo]);
    setNovoNome('');
    setNovaDuracao('');
    setNovoPreco('');
  }

  function removerServico(id) {
    setServicos(servicos.filter(s => s.id !== id));
  }

  return (
    <div className="servicos-container">
      <header className="servicos-header">
        <div>
          <h1>Meus Serviços</h1>
          <p>Gerencie os cortes e valores da sua barbearia</p>
        </div>
      </header>

      <div className="servicos-content">
        {/* FORMULÁRIO DE CADASTRO */}
        <form className="form-servico card" onSubmit={adicionarServico}>
          <h3>Adicionar Novo Serviço</h3>
          
          <div className="input-group">
            <label>Nome do Corte</label>
            <input 
              type="text" 
              placeholder="Ex: Degradê Premium" 
              value={novoNome}
              onChange={e => setNovoNome(e.target.value)}
            />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Duração (min)</label>
              <input 
                type="number" 
                placeholder="30" 
                value={novaDuracao}
                onChange={e => setNovaDuracao(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Preço (R$)</label>
              <input 
                type="number" 
                placeholder="60" 
                value={novoPreco}
                onChange={e => setNovoPreco(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary full">
            <Plus size={18} /> Adicionar Serviço
          </button>
        </form>

        {/* LISTA DE SERVIÇOS */}
        <div className="lista-servicos">
          <h3>Serviços Cadastrados</h3>
          {servicos.length === 0 && (
            <p className="empty-msg">Nenhum serviço cadastrado ainda.</p>
          )}
          
          {servicos.map(servico => (
            <div key={servico.id} className="servico-item card">
              <div className="servico-info">
                <h4>{servico.nome}</h4>
                <div className="servico-detalhes">
                  <span><Clock size={14} /> {servico.duracao} min</span>
                  <span className="preco"><DollarSign size={14} /> R$ {servico.preco},00</span>
                </div>
              </div>
              <button 
                className="btn-delete" 
                onClick={() => removerServico(servico.id)}
                title="Remover serviço"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}