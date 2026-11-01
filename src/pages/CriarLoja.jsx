import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Store, Link as LinkIcon, Camera, Clock, Utensils } from 'lucide-react';
import './CriarLoja.css';

export default function CriarLoja() {
  const [nomeLoja, setNomeLoja] = useState('');
  const [slug, setSlug] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  
  // Estados para horário de funcionamento
  const [abertura, setAbertura] = useState('09:00');
  const [fechamento, setFechamento] = useState('19:00');
  const [almocoInicio, setAlmocoInicio] = useState('12:00');
  const [almocoFim, setAlmocoFim] = useState('13:00');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [usuario, setUsuario] = useState(undefined); 
  const navigate = useNavigate();

  // Pega o plano que o barbeiro escolheu na tela de Planos
  const planoEscolhido = localStorage.getItem('planoEscolhido') || 'basico';

  // 1. Escuta o usuário logado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  // 2. Se o usuário existir, busca a loja dele no banco
  useEffect(() => {
    async function fetchLoja() {
      if (!usuario) {
        setCarregando(false);
        return; 
      }
      
      try {
        const docRef = doc(db, "barbearias", usuario.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const data = docSnap.data();
          setNomeLoja(data.nome || '');
          setSlug(data.slug || '');
          setFotoUrl(data.fotoUrl || '');
          setAbertura(data.abertura || '09:00');
          setFechamento(data.fechamento || '19:00');
          setAlmocoInicio(data.almocoInicio || '12:00');
          setAlmocoFim(data.almocoFim || '13:00');
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchLoja();
  }, [usuario]);

  function gerarSlug(texto) {
    const slugFormatado = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(slugFormatado);
  }

  async function salvarLoja(e) {
    e.preventDefault();
    if (!nomeLoja || !slug || !usuario) return;

    setSalvando(true);
    try {
      await setDoc(doc(db, "barbearias", usuario.uid), {
        nome: nomeLoja,
        slug: slug,
        fotoUrl: fotoUrl,
        abertura: abertura,
        fechamento: fechamento,
        almocoInicio: almocoInicio,
        almocoFim: almocoFim,
        plano: planoEscolhido,
        donoId: usuario.uid,
        donoEmail: usuario.email,
        criadoEm: new Date()
      });

      // Mostra o alerta e redireciona após o usuário clicar em OK
      alert(`✅ Loja criada com sucesso!\nAgora vamos para o pagamento.`);
      navigate('/checkout'); 
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao criar a loja. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (usuario === undefined || carregando) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--muted)' }}>Carregando dados da loja...</p>;
  }

  // 4. Tela de bloqueio se não estiver logado
  if (usuario === null) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Acesso Restrito</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>Você precisa estar logado para criar sua loja.</p>
        <button 
          className="btn-primary" 
          onClick={() => {
            localStorage.setItem('abrirLogin', 'true');
            navigate('/');
          }} 
        >
          Fazer Login ou Cadastro
        </button>
      </div>
    );
  }

  // 5. Formulário normal
  return (
    <div className="criar-loja-container">
      <div className="criar-loja-card card" style={{ maxWidth: '600px' }}>
        <div className="header-logo">
          <Store size={32} color="var(--gold)" />
          <h2>Minha Barbearia</h2>
          <p>Você está assinando o plano: <strong style={{ color: 'var(--gold)', textTransform: 'uppercase' }}>{planoEscolhido}</strong></p>
        </div>

        <form onSubmit={salvarLoja}>
          <div className="input-group">
            <label>Nome da Barbearia</label>
            <input 
              type="text" 
              value={nomeLoja}
              onChange={e => {
                setNomeLoja(e.target.value);
                gerarSlug(e.target.value);
              }}
              placeholder="Ex: Navalha D'Or"
              required
            />
          </div>

          <div className="input-group">
            <label><LinkIcon size={14} /> Seu Link Exclusivo</label>
            <div className="slug-input-group">
              <span className="slug-prefix">localhost:5173/</span>
              <input 
                type="text" 
                value={slug}
                onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                placeholder="rafael-andrade"
                required
              />
            </div>
            <small style={{ color: 'var(--muted)', fontSize: '11px', marginTop: '4px', display: 'block' }}>
              Este será o link que você vai colocar na sua bio do Instagram.
            </small>
          </div>

          {/* CAMPOS DE HORÁRIO */}
          <div className="input-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label><Clock size={14} /> Abertura</label>
              <input type="time" value={abertura} onChange={e => setAbertura(e.target.value)} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label><Clock size={14} /> Fechamento</label>
              <input type="time" value={fechamento} onChange={e => setFechamento(e.target.value)} required />
            </div>
          </div>

          <div className="input-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label><Utensils size={14} /> Início do Almoço</label>
              <input type="time" value={almocoInicio} onChange={e => setAlmocoInicio(e.target.value)} required />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label><Utensils size={14} /> Fim do Almoço</label>
              <input type="time" value={almocoFim} onChange={e => setAlmocoFim(e.target.value)} required />
            </div>
          </div>

          <div className="input-group">
            <label><Camera size={14} /> URL da Foto de Perfil (Opcional)</label>
            <input 
              type="url" 
              value={fotoUrl}
              onChange={e => setFotoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <button type="submit" className="btn-primary full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Loja e Gerar Link'}
          </button>
        </form>
      </div>
    </div>
  );
}