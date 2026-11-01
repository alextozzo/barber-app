import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Store, Link as LinkIcon, Camera, Clock, Utensils, Scissors } from 'lucide-react';
import './CriarLoja.css';

export default function CriarLoja() {
  const [nomeLoja, setNomeLoja] = useState('');
  const [slug, setSlug] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [nicho, setNicho] = useState('barbearia'); // <-- NOVO ESTADO
  
  const [abertura, setAbertura] = useState('09:00');
  const [fechamento, setFechamento] = useState('19:00');
  const [almocoInicio, setAlmocoInicio] = useState('12:00');
  const [almocoFim, setAlmocoFim] = useState('13:00');
  const [corPrincipal, setCorPrincipal] = useState('#C9A961');

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [usuario, setUsuario] = useState(undefined); 
  const navigate = useNavigate();

  const planoEscolhido = localStorage.getItem('planoEscolhido') || 'basico';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

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
          setNicho(data.nicho || 'barbearia');
          setAbertura(data.abertura || '09:00');
          setFechamento(data.fechamento || '19:00');
          setAlmocoInicio(data.almocoInicio || '12:00');
          setAlmocoFim(data.almocoFim || '13:00');
          setCorPrincipal(data.corPrincipal || '#C9A961');
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
      // 1. Salva os dados da loja
      await setDoc(doc(db, "barbearias", usuario.uid), {
        nome: nomeLoja,
        slug: slug,
        fotoUrl: fotoUrl,
        nicho: nicho, // <-- SALVA O NICHO
        abertura: abertura,
        fechamento: fechamento,
        almocoInicio: almocoInicio,
        almocoFim: almocoFim,
        corPrincipal: corPrincipal,
        plano: planoEscolhido,
        donoId: usuario.uid,
        donoEmail: usuario.email,
        criadoEm: new Date()
      });

      // 2. Cria os serviços padrão baseados no nicho
      const servicosPadrao = {
        barbearia: [
          { nome: 'Corte Clássico', duracao: 30, preco: 60 },
          { nome: 'Corte + Barba', duracao: 60, preco: 100 },
          { nome: 'Barba Terapia', duracao: 45, preco: 70 },
        ],
        manicure: [
          { nome: 'Manicure Simples', duracao: 40, preco: 40 },
          { nome: 'Pedicure', duracao: 40, preco: 40 },
          { nome: 'Alongamento em Gel', duracao: 90, preco: 150 },
        ],
        tatuador: [
          { nome: 'Sessão Pequena', duracao: 60, preco: 200 },
          { nome: 'Sessão Média', duracao: 120, preco: 400 },
          { nome: 'Sessão Grande', duracao: 240, preco: 800 },
        ],
        estetica: [
          { nome: 'Limpeza de Pele', duracao: 60, preco: 120 },
          { nome: 'Design de Sobrancelha', duracao: 30, preco: 50 },
        ],
        pet: [
          { nome: 'Banho Pequeno Porte', duracao: 60, preco: 60 },
          { nome: 'Tosa Higiênica', duracao: 45, preco: 70 },
        ]
      };

      const servicosParaCriar = servicosPadrao[nicho] || servicosPadrao.barbearia;
      
      for (const servico of servicosParaCriar) {
        await addDoc(collection(db, "servicos"), {
          barbeiroId: usuario.uid,
          nome: servico.nome,
          duracao: servico.duracao,
          preco: servico.preco
        });
      }

      alert(`✅ Loja criada com sucesso!\nOs serviços padrão do nicho "${nicho}" já foram adicionados.`);
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

  return (
    <div className="criar-loja-container">
      <div className="criar-loja-card card" style={{ maxWidth: '600px' }}>
        <div className="header-logo">
          <Store size={32} color={corPrincipal} />
          <h2>Meu Negócio</h2>
          <p>Configure os dados da sua loja para gerar seu link exclusivo.</p>
        </div>

        <form onSubmit={salvarLoja}>
          <div className="input-group">
            <label>Nome do Estabelecimento</label>
            <input type="text" value={nomeLoja} onChange={e => { setNomeLoja(e.target.value); gerarSlug(e.target.value); }} placeholder="Ex: Agendaê Studio" required />
          </div>

          {/* NOVO CAMPO: TIPO DE NEGÓCIO */}
          <div className="input-group">
            <label>Tipo de Negócio</label>
            <select 
              value={nicho} 
              onChange={e => setNicho(e.target.value)}
              style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', color: 'var(--cream)', fontFamily: 'Poppins, sans-serif' }}
            >
              <option value="barbearia">Barbearia</option>
              <option value="manicure">Manicure / Salão</option>
              <option value="tatuador">Tatuador / Estúdio</option>
              <option value="estetica">Estética / Sobrancelha</option>
              <option value="pet">Pet Shop / Banho e Tosa</option>
            </select>
          </div>

          <div className="input-group">
            <label><LinkIcon size={14} /> Seu Link Exclusivo</label>
            <div className="slug-input-group">
              <span className="slug-prefix">agendae.com.br/</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} required />
            </div>
          </div>

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

          {planoEscolhido === 'premium' && (
            <div className="input-group">
              <label>Cor Principal da Marca (Premium)</label>
              <input type="color" value={corPrincipal} onChange={e => setCorPrincipal(e.target.value)} style={{ width: '100%', height: '50px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px' }} />
            </div>
          )}

          <div className="input-group">
            <label><Camera size={14} /> URL da Foto de Perfil (Opcional)</label>
            <input type="url" value={fotoUrl} onChange={e => setFotoUrl(e.target.value)} placeholder="https://..." />
          </div>

          <button type="submit" className="btn-primary full" disabled={salvando}>
            {salvando ? 'Salvando...' : 'Salvar Loja e Gerar Link'}
          </button>
        </form>
      </div>
    </div>
  );
}