import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, Lock, DollarSign, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Assinaturas.css';

export default function Assinaturas() {
  const [assinaturas, setAssinaturas] = useState([]);
  const [nome, setNome] = useState('');
  const [preco, setPreco] = useState('');
  const [cortes, setCortes] = useState('4'); // Padrão: 4 cortes/mês
  const [carregando, setCarregando] = useState(true);
  const [plano, setPlano] = useState('basico');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setPlano(lojaSnap.data().plano || 'basico');
        }
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!auth.currentUser) return;
    const q = query(collection(db, "planos_assinatura"), where("lojaId", "==", auth.currentUser.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = [];
      snapshot.forEach((doc) => {
        lista.push({ id: doc.id, ...doc.data() });
      });
      setAssinaturas(lista);
      setCarregando(false);
    });
    return () => unsubscribe();
  }, []);

  async function adicionarPlano(e) {
    e.preventDefault();
    if (!nome || !preco || !auth.currentUser) return;

    try {
      await addDoc(collection(db, "planos_assinatura"), {
        lojaId: auth.currentUser.uid,
        nome,
        preco: Number(preco),
        cortes: Number(cortes),
        criadoEm: new Date()
      });
      setNome('');
      setPreco('');
      setCortes('4');
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      alert("Erro ao criar plano.");
    }
  }

  async function removerPlano(id) {
    if (!window.confirm("Remover este plano de assinatura?")) return;
    try {
      await deleteDoc(doc(db, "planos_assinatura", id));
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  }

  if (carregando) return <p style={{ padding: '40px', color: 'var(--muted)' }}>Carregando...</p>;

  // Trava de Plano: Básico não tem assinaturas
  if (plano === 'basico') {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--cream)' }}>Recurso Pro/Premium</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>A gestão de planos de assinatura está disponível nos planos Pro e Premium.</p>
        <Link to="/planos" className="btn-primary">Fazer Upgrade</Link>
      </div>
    );
  }

  return (
    <div className="assinaturas-container">
      <header className="assinaturas-header">
        <h1>Planos de Assinatura</h1>
        <p>Ofereça planos mensais para seus clientes e garanta receita recorrente.</p>
      </header>

      <div className="assinaturas-content">
        <form className="form-assinatura card" onSubmit={adicionarPlano}>
          <h3>Criar Novo Plano</h3>
          
          <div className="input-group">
            <label>Nome do Plano</label>
            <input type="text" placeholder="Ex: Clube do Corte" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div className="input-row">
            <div className="input-group">
              <label>Valor Mensal (R$)</label>
              <input type="number" placeholder="150" value={preco} onChange={e => setPreco(e.target.value)} required />
            </div>
            <div className="input-group">
              <label>Cortes por Mês</label>
              <input type="number" placeholder="4" value={cortes} onChange={e => setCortes(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn-primary full">
            <Plus size={18} /> Criar Plano
          </button>
        </form>

        <div className="lista-assinaturas">
          <h3>Planos Cadastrados</h3>
          {assinaturas.length === 0 ? (
            <p className="empty-msg">Nenhum plano criado ainda.</p>
          ) : (
            assinaturas.map(assinatura => (
              <div key={assinatura.id} className="assinatura-item card">
                <div className="assinatura-info">
                  <h4>{assinatura.nome}</h4>
                  <div className="assinatura-detalhes">
                    <span><DollarSign size={14} /> R$ {assinatura.preco},00 /mês</span>
                    <span><Calendar size={14} /> {assinatura.cortes} cortes</span>
                  </div>
                </div>
                <button className="btn-delete" onClick={() => removerPlano(assinatura.id)}>
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