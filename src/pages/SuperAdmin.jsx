import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, onSnapshot, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Trash2, Store, Mail, Phone } from 'lucide-react';
import './SuperAdmin.css'; // Vamos criar o CSS abaixo

export default function SuperAdmin() {
  const [barbearias, setBarbearias] = useState([]);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');

  // Puxa a lista de barbearias em tempo real
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

  async function cadastrarBarbearia(e) {
    e.preventDefault();
    if (!nome || !email || !telefone) return;

    try {
      await addDoc(collection(db, "barbearias"), {
        nome,
        email,
        telefone,
        status: 'ativo',
        criadoEm: new Date()
      });

      setNome('');
      setEmail('');
      setTelefone('');
      alert("Barbearia cadastrada com sucesso!");
    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar.");
    }
  }

  async function removerBarbearia(id) {
    if (window.confirm("Tem certeza que deseja remover esta barbearia?")) {
      await deleteDoc(doc(db, "barbearias", id));
    }
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h1>Painel do Super Admin</h1>
        <p>Gerencie as barbearias cadastradas no sistema</p>
      </header>

      <div className="admin-content">
        {/* FORMULÁRIO DE CADASTRO */}
        <form className="form-admin card" onSubmit={cadastrarBarbearia}>
          <h3>Cadastrar Nova Barbearia</h3>
          
          <div className="input-group">
            <label>Nome da Barbearia</label>
            <input 
              type="text" 
              placeholder="Ex: Navalha D'Or" 
              value={nome}
              onChange={e => setNome(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>E-mail do Dono</label>
            <input 
              type="email" 
              placeholder="dono@barbearia.com" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Telefone</label>
            <input 
              type="tel" 
              placeholder="(11) 99999-9999" 
              value={telefone}
              onChange={e => setTelefone(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary full">
            <Plus size={18} /> Cadastrar Barbearia
          </button>
        </form>

        {/* LISTA DE BARBEARIAS */}
        <div className="lista-admin">
          <h3>Barbearias Cadastradas</h3>
          
          {barbearias.length === 0 ? (
            <p className="empty-msg">Nenhuma barbearia cadastrada ainda.</p>
          ) : (
            barbearias.map(barbearia => (
              <div key={barbearia.id} className="admin-item card">
                <div className="admin-info">
                  <h4><Store size={16} /> {barbearia.nome}</h4>
                  <p><Mail size={14} /> {barbearia.email}</p>
                  <p><Phone size={14} /> {barbearia.telefone}</p>
                </div>
                <div className="admin-actions">
                  <span className="status-badge">{barbearia.status}</span>
                  <button className="btn-delete" onClick={() => removerBarbearia(barbearia.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}