import { useState, useEffect } from 'react';
import { Plus, Trash2, Clock, DollarSign } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc } from 'firebase/firestore';
import './Servicos.css';

export default function Servicos() {
  const [servicos, setServicos] = useState([]);
  const [novoNome, setNovoNome] = useState('');
  const [novaDuracao, setNovaDuracao] = useState('');
  const [novoPreco, setNovoPreco] = useState('');
  const [carregando, setCarregando] = useState(true);

  // Puxa os serviços do barbeiro logado em tempo real
  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, "servicos"), 
      where("barbeiroId", "==", auth.currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setServicos(lista);
      setCarregando(false);
    });

    return () => unsubscribe();
  }, []);

  async function adicionarServico(e) {
    e.preventDefault();
    if (!novoNome || !novaDuracao || !novoPreco || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "servicos"), {
        barbeiroId: auth.currentUser.uid,
        nome: novoNome,
        duracao: Number(novaDuracao),
        preco: Number(novoPreco),
      });

      setNovoNome('');
      setNovaDuracao('');
      setNovoPreco('');
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      alert("Erro ao salvar o serviço.");
    }
  }

  async function removerServico(id) {
    if (!window.confirm("Tem certeza que deseja remover este serviço?")) return;
    
    try {
      await deleteDoc(doc(db, "servicos", id));
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  }

  if (!auth.currentUser) {
    return <p style={{ color: 'var(--gold)' }}>Faça login para gerenciar seus serviços.</p>;
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
              required
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
                required
              />
            </div>
            <div className="input-group">
              <label>Preço (R$)</label>
              <input 
                type="number" 
                placeholder="60" 
                value={novoPreco}
                onChange={e => setNovoPreco(e.target.value)}
                required
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
          
          {carregando ? (
            <p className="empty-msg">Carregando serviços...</p>
          ) : servicos.length === 0 ? (
            <p className="empty-msg">Nenhum serviço cadastrado ainda.</p>
          ) : (
            servicos.map(servico => (
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}