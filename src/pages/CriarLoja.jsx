import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Store, Link as LinkIcon, Camera } from 'lucide-react';
import './CriarLoja.css';

export default function CriarLoja() {
  const [nomeLoja, setNomeLoja] = useState('');
  const [slug, setSlug] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [usuario, setUsuario] = useState(undefined); 
  const navigate = useNavigate();

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
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchLoja();
  }, [usuario]);

  // Transforma o nome em um link amigável (ex: "Rafael Andrade" -> "rafael-andrade")
  function gerarSlug(texto) {
    const slugFormatado = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[^a-z0-9]+/g, '-')     // Troca espaços e símbolos por hífen
      .replace(/^-+|-+$/g, '');         // Remove hífens do começo e fim
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
        donoId: usuario.uid,
        donoEmail: usuario.email,
        criadoEm: new Date()
      });

      alert(`✅ Loja criada com sucesso!\nSeu link é: seusite.com/${slug}`);
      navigate(`/${slug}`); // Redireciona para a página da loja
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao criar a loja. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  // 3. Tela de carregamento enquanto o Firebase responde
  if (usuario === undefined || carregando) {
    return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--muted)' }}>Carregando dados da loja...</p>;
  }

  // 4. Tela de bloqueio se não estiver logado
  if (usuario === null) {
    return (
      <div style={{ textAlign: 'center', marginTop: '100px' }}>
        <h2 style={{ color: 'var(--gold)', marginBottom: '20px' }}>Acesso Restrito</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>Você precisa estar logado para criar sua loja.</p>
        <a href="/" className="btn-primary">Ir para a página inicial e fazer Login</a>
      </div>
    );
  }

  // 5. Formulário normal
  return (
    <div className="criar-loja-container">
      <div className="criar-loja-card card">
        <div className="header-logo">
          <Store size={32} color="var(--gold)" />
          <h2>Minha Barbearia</h2>
          <p>Configure os dados da sua loja para gerar seu link exclusivo.</p>
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