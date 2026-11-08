import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, addDoc, onSnapshot, query, where, deleteDoc, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Plus, Trash2, User, Lock, Camera, Phone, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Equipe.css';

export default function Equipe() {
  const [equipe, setEquipe] = useState([]);
  const [nome, setNome] = useState('');
  const [especialidade, setEspecialidade] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  
  // Estados para a galeria de cortes
  const [galeriaCortes, setGaleriaCortes] = useState(['', '', '', '', '']);
  
  const [carregando, setCarregando] = useState(true);
  const [plano, setPlano] = useState('basico');

  useEffect(() => {
    let unsubscribeEquipe = null;
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setPlano(lojaSnap.data().plano || 'basico');
        }

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

  function atualizarGaleriaCorte(index, url) {
    const novaGaleria = [...galeriaCortes];
    novaGaleria[index] = url;
    setGaleriaCortes(novaGaleria);
  }

  async function adicionarMembro(e) {
    e.preventDefault();
    if (!nome || !whatsapp || !auth.currentUser) return;

    try {
      const cortesFiltrados = galeriaCortes.filter(url => url.trim() !== '');

      await addDoc(collection(db, "funcionarios"), {
        lojaId: auth.currentUser.uid,
        nome,
        especialidade: especialidade || 'Barbeiro',
        fotoUrl: fotoUrl,
        whatsapp: whatsapp,
        galeriaCortes: cortesFiltrados,
        criadoEm: new Date()
      });
      
      setNome('');
      setEspecialidade('');
      setWhatsapp('');
      setFotoUrl('');
      setGaleriaCortes(['', '', '', '', '']);

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

  if (plano !== 'premium') {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <Lock size={48} color="var(--gold)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--cream)' }}>Recurso Exclusivo Premium</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>A gestão de equipe está disponível apenas no Plano Premium.</p>
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

          <div className="input-group">
            <label><Phone size={14} /> WhatsApp (com DDD)</label>
            <input 
              type="tel" 
              placeholder="Ex: 11999998888" 
              value={whatsapp} 
              onChange={e => setWhatsapp(e.target.value.replace(/\D/g, ''))} 
              required 
            />
          </div>

          <div className="input-group">
            <label><Camera size={14} /> Link da Foto de Perfil</label>
            <input 
              type="url" 
              placeholder="Cole o link da imagem aqui (ex: https://i.imgur.com/...)" 
              value={fotoUrl} 
              onChange={e => setFotoUrl(e.target.value)} 
            />
            {fotoUrl && (
              <div style={{ marginTop: '10px' }}>
                <img src={fotoUrl} alt="Preview" style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' }} onError={(e) => e.target.style.display = 'none'} />
              </div>
            )}
          </div>

          <div className="input-group" style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid var(--border)' }}>
            <label><ImageIcon size={14} /> Galeria de Cortes (Portfólio)</label>
            <p style={{ fontSize: '12px', color: 'var(--muted)', marginBottom: '10px' }}>Cole os links das fotos dos trabalhos deste barbeiro.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {galeriaCortes.map((url, index) => (
                <div key={index}>
                  <input 
                    type="url" 
                    placeholder={`Foto ${index + 1} (https://...)`} 
                    value={url} 
                    onChange={e => atualizarGaleriaCorte(index, e.target.value)} 
                    style={{ fontSize: '12px', padding: '10px' }}
                  />
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary full" style={{ marginTop: '20px' }}>
            <Plus size={18} /> Adicionar à Equipe
          </button>
        </form>

        <div className="lista-equipe">
          <h3>Profissionais Cadastrados</h3>
          
          {equipe.length === 0 ? (
            <p className="empty-msg">Nenhum profissional cadastrado ainda.</p>
          ) : (
            equipe.map(membro => (
              <div key={membro.id} className="equipe-item card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
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

                {membro.galeriaCortes && membro.galeriaCortes.length > 0 && (
                  <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '11px', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Portfólio de Cortes</span>
                    <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '8px', paddingBottom: '4px' }}>
                      {membro.galeriaCortes.map((foto, i) => (
                        <img 
                          key={i} 
                          src={foto} 
                          alt={`Corte ${i}`} 
                          style={{ width: '60px', height: '60px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }} 
                          onError={(e) => e.target.style.display = 'none'}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}