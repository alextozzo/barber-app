import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, User, Lock, Camera, Phone } from 'lucide-react'; // Adicionei o Phone
import { Link } from 'react-router-dom';
import './Equipe.css';

export default function Equipe() {
  const [equipe, setEquipe] = useState([]);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [whatsapp, setWhatsapp] = useState(''); // NOVO ESTADO
  const [carregando, setCarregando] = useState(true);
  const [plano, setPlano] = useState('basico');

  // useEffect UNIFICADO E CORRIGIDO
  useEffect(() => {
    let unsubscribeEquipe = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // 1. Verifica o plano
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setPlano(lojaSnap.data().plano || 'basico');
        }

        // 2. Puxa a equipe APENAS quando o usuário estiver confirmado
        const q = query(collection(db, "funcionarios"), where("lojaId", "==", user.uid));
        unsubscribeEquipe = onSnapshot(q, (snapshot) => {
          const lista = [];
          snapshot.forEach((doc) => {
            lista.push({ id: doc.id, ...doc.data() });
          });
          setEquipe(lista);
          setCarregando(false);
        });
      } else {
        setCarregando(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeEquipe) unsubscribeEquipe();
    };
  }, []);

  async function adicionarMembro(e) {
    e.preventDefault();
    // Agora exige o WhatsApp também
    if (!nome || !whatsapp || !auth.currentUser) return; 

    try {
      await addDoc(collection(db, "funcionarios"), {
        lojaId: auth.currentUser.uid,
        nome,
        especialidade: especialidade || 'Barbeiro',
        fotoUrl: fotoUrl,
        whatsapp: whatsapp, // SALVA O WHATSAPP AQUI
        criadoEm: new Date()
      });
      setNome('');
      setEspecialidade('');
      setFotoUrl('');
      setWhatsapp(''); // LIMPA O WHATSAPP
    } catch (error) {
      console.error("Erro ao adicionar:", error);
      alert("Erro ao adicionar membro.");
    }
  }

  async function removerMembro(id) {
    if (!window.confirm("Remover este profissional da equipe?")) return;
    try {
      await deleteDoc(doc(db, "funcionarios", id));
    } catch (error) {
      console.error("Erro ao remover:", error);
    }
  }

  if (carregando) return <p style={{ padding: '40px', color: 'var(--muted)' }}>Carregando...</p>;

  // Trava de plano: Só Premium tem equipe
  if (plano !== 'premium') {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <Lock size={48} color="var(--gold)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--cream)' }}>Recurso Exclusivo Premium</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>A gestão de equipe (múltiplos barbeiros) está disponível apenas no Plano Premium.</p>
        <Link to="/planos" className="btn-primary">Fazer Upgrade</Link>
      </div>
    );
  }

  return (
    <div className="equipe-container">
      <header className="equipe-header">
        <h1>Minha Equipe</h1>
        <p>Adicione os barbeiros que trabalham na sua loja.</p>
      </header>

      <div className="equipe-content">
        <form className="form-equipe card" onSubmit={adicionarMembro}>
          <h3>Adicionar Profissional</h3>
          
          <div className="input-group">
            <label>Nome do Barbeiro</label>
            <input type="text" placeholder="Ex: João Silva" value={nome} onChange={e => setNome(e.target.value)} required />
          </div>

          <div className="input-group">
            <label>Especialidade</label>
            <input type="text" placeholder="Ex: Degradê, Barba" value={especialidade} onChange={e => setEspecialidade(e.target.value)} />
          </div>

          {/* NOVO CAMPO: WHATSAPP */}
          <div className="input-group">
            <label><Phone size={14} /> WhatsApp (com DDD)</label>
            <input 
              type="tel" 
              placeholder="Ex: 11999998888" 
              value={whatsapp} 
              onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} // Remove tudo que não for número
              required 
            />
          </div>

          <div className="input-group">
            <label><Camera size={14} /> URL da Foto do Profissional</label>
            <input 
              type="url" 
              placeholder="https://..." 
              value={fotoUrl} 
              onChange={e => setFotoUrl(e.target.value)} 
            />
          </div>

          <button type="submit" className="btn-primary full">
            <Plus size={18} /> Adicionar à Equipe
          </button>
        </form>

        <div className="lista-equipe">
          <h3>Profissionais Cadastrados</h3>
          
          {equipe.length === 0 ? (
            <p className="empty-msg">Nenhum profissional cadastrado ainda.</p>
          ) : (
            equipe.map(membro => (
              <div key={membro.id} className="equipe-item card">
                <div className="equipe-info">
                  <div className="equipe-avatar">
                    {membro.fotoUrl ? (
                      <img src={membro.fotoUrl} alt={membro.nome} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div>
                    <h4>{membro.nome}</h4>
                    <span>{membro.especialidade}</span>
                    {/* Mostra o WhatsApp cadastrado no card */}
                    {membro.whatsapp && (
                      <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Phone size={12} /> {membro.whatsapp}
                      </p>
                    )}
                  </div>
                </div>
                <button className="btn-delete" onClick={() => removerMembro(membro.id)}>
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