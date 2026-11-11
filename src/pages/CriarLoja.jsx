import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, setDoc, getDoc, collection, addDoc, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Store, Link as LinkIcon, Camera, Clock, Utensils, MapPin, AtSign, Phone, DollarSign, Image, AlertCircle, UploadCloud } from 'lucide-react';
import './CriarLoja.css';

// CHAVE DO IMGBB CONFIGURADA
const IMGBB_API_KEY = '42f6f47c1a272912cd2c20b31c075868';

export default function CriarLoja() {
  const [nomeLoja, setNomeLoja] = useState('');
  const [slug, setSlug] = useState('');
  const [fotoUrl, setFotoUrl] = useState('');
  const [fotoCapa, setFotoCapa] = useState('');
  const [nicho, setNicho] = useState('barbearia');
  
  const [endereco, setEndereco] = useState('');
  const [instagram, setInstagram] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [formasPagamento, setFormasPagamento] = useState([]);
  const [chavePix, setChavePix] = useState('');
  const [sobre, setSobre] = useState('');

  const [galeria, setGaleria] = useState(['', '', '', '', '']); 
  const [comodidades, setComodidades] = useState([]);

  const [abertura, setAbertura] = useState('09:00');
  const [fechamento, setFechamento] = useState('19:00');
  const [almocoInicio, setAlmocoInicio] = useState('12:00');
  const [almocoFim, setAlmocoFim] = useState('13:00');
  const [corPrincipal, setCorPrincipal] = useState('#3B82F6');

  const [prazoCancelamento, setPrazoCancelamento] = useState(2); 
  const [taxaCancelamento, setTaxaCancelamento] = useState(0);

  const [aceitouTermos, setAceitouTermos] = useState(false);
  const [aceitaMarketing, setAceitaMarketing] = useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [usuario, setUsuario] = useState(undefined); 
  
  const [lojaExistente, setLojaExistente] = useState(null);

  const navigate = useNavigate();

  const planoEscolhido = localStorage.getItem('planoEscolhido') || 'basico';
  const limiteFotos = planoEscolhido === 'premium' ? 5 : planoEscolhido === 'pro' ? 3 : 0;

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchLoja() {
      if (usuario === undefined) return;
      if (usuario === null) {
        setCarregando(false);
        return; 
      }
      try {
        const docRef = doc(db, "barbearias", usuario.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setLojaExistente(data);
          
          setNomeLoja(data.nome || '');
          setSlug(data.slug || '');
          setFotoUrl(data.fotoUrl || '');
          setFotoCapa(data.fotoCapa || '');
          setNicho(data.nicho || 'barbearia');
          setEndereco(data.endereco || '');
          setInstagram(data.instagram || '');
          setWhatsapp(data.whatsapp || '');
          setFormasPagamento(data.formasPagamento || []);
          setChavePix(data.chavePix || '');
          setSobre(data.sobre || '');
          
          const galeriaSalva = data.galeria || [];
          const galeriaCompleta = Array(5).fill('').map((_, i) => galeriaSalva[i] || '');
          setGaleria(galeriaCompleta);

          setComodidades(data.comodidades || []); 
          setAbertura(data.abertura || '09:00');
          setFechamento(data.fechamento || '19:00');
          setAlmocoInicio(data.almocoInicio || '12:00');
          setAlmocoFim(data.almocoFim || '13:00');
          setCorPrincipal(data.corPrincipal || '#3B82F6');

          setPrazoCancelamento(data.prazoCancelamento || 2);
          setTaxaCancelamento(data.taxaCancelamento || 0);
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchLoja();
  }, [usuario]);

  // --- FUNÇÃO DE UPLOAD PARA O IMGBB ---
  async function uploadImagem(file) {
    if (!file) return '';
    setEnviandoImagem(true);
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        return data.data.url;
      }
      alert("Erro ao fazer upload da imagem. Tente novamente.");
      return '';
    } catch (error) {
      console.error("Erro no upload:", error);
      alert("Erro de conexão ao enviar a imagem.");
      return '';
    } finally {
      setEnviandoImagem(false);
    }
  }
  // -------------------------------------

  function gerarSlug(texto) {
    const slugFormatado = texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(slugFormatado);
  }

  function handleWhatsApp(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    setWhatsapp(value);
  }

  function togglePagamento(forma) {
    if (formasPagamento.includes(forma)) {
      setFormasPagamento(formasPagamento.filter(f => f !== forma));
    } else {
      setFormasPagamento([...formasPagamento, forma]);
    }
  }

  function toggleComodidade(comodidade) {
    if (comodidades.includes(comodidade)) {
      setComodidades(comodidades.filter(c => c !== comodidade));
    } else {
      setComodidades([...comodidades, comodidade]);
    }
  }

  function atualizarGaleria(index, url) {
    const novaGaleria = [...galeria];
    novaGaleria[index] = url;
    setGaleria(novaGaleria);
  }

  async function salvarLoja(e) {
    e.preventDefault();
    if (!nomeLoja || !slug || !usuario) return;

    if (whatsapp && whatsapp.replace(/\D/g, '').length < 10) {
      alert('WhatsApp inválido. Digite DDD + número.');
      return;
    }

    if (!lojaExistente && !aceitouTermos) {
      alert('⚠️ Você precisa aceitar os Termos de Uso e a Política de Privacidade para criar sua loja.');
      return;
    }

    setSalvando(true);
    try {
      const lojasRef = collection(db, "barbearias");
      const q = query(lojasRef, where("slug", "==", slug));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty && querySnapshot.docs[0].id !== usuario.uid) {
        alert("⚠️ Este link já está em uso por outra barbearia. Escolha outro.");
        setSalvando(false);
        return;
      }

      const galeriaFinal = galeria.slice(0, limiteFotos).filter(f => f);

      const statusPagamento = lojaExistente ? lojaExistente.statusPagamento : 'pendente';
      const validadePlano = lojaExistente ? lojaExistente.validadePlano : null;
      const dataCriacao = lojaExistente ? lojaExistente.criadoEm : new Date();

      await setDoc(doc(db, "barbearias", usuario.uid), {
        nome: nomeLoja,
        slug: slug,
        fotoUrl: fotoUrl,
        fotoCapa: fotoCapa,
        nicho: nicho,
        endereco: endereco,
        instagram: instagram,
        whatsapp: whatsapp,
        formasPagamento: formasPagamento,
        chavePix: chavePix,
        sobre: sobre,
        galeria: galeriaFinal, 
        comodidades: comodidades, 
        abertura: abertura,
        fechamento: fechamento,
        almocoInicio: almocoInicio,
        almocoFim: almocoFim,
        corPrincipal: corPrincipal,
        plano: planoEscolhido,
        statusPagamento: statusPagamento,
        validadePlano: validadePlano,
        donoId: usuario.uid,
        donoEmail: usuario.email,
        criadoEm: dataCriacao,
        prazoCancelamento: Number(prazoCancelamento),
        taxaCancelamento: Number(taxaCancelamento),
        aceitouTermos: true,
        aceitaMarketing: aceitaMarketing,
        dataAceiteTermos: lojaExistente?.dataAceiteTermos || new Date()
      });

      if (!lojaExistente) {
        const servicosPadrao = {
          barbearia: [ { nome: 'Corte Clássico', duracao: 30, preco: 60 }, { nome: 'Corte + Barba', duracao: 60, preco: 100 } ],
          manicure: [ { nome: 'Manicure Simples', duracao: 40, preco: 40 }, { nome: 'Pedicure', duracao: 40, preco: 40 } ],
          tatuador: [ { nome: 'Sessão Pequena', duracao: 60, preco: 200 }, { nome: 'Sessão Média', duracao: 120, preco: 400 } ],
          estetica: [ { nome: 'Limpeza de Pele', duracao: 60, preco: 120 } ],
          pet: [ { nome: 'Banho Pequeno Porte', duracao: 60, preco: 60 } ]
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

        alert(`✅ Loja criada com sucesso!\n\nSeu link é: quero1horario.com.br/${slug}`);
        navigate('/checkout'); 
      } else {
        alert("✅ Dados da loja atualizados com sucesso!");
        navigate('/painel');
      }
      
    } catch (error) {
      console.error("Erro ao salvar:", error);
      alert("Erro ao salvar a loja. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  if (usuario === undefined) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--muted)' }}>Verificando login...</p>;
  if (usuario === null) return (
    <div style={{ textAlign: 'center', marginTop: '100px' }}>
      <h2 style={{ color: 'var(--primary)', marginBottom: '20px' }}>Acesso Restrito</h2>
      <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>Você precisa estar logado para criar sua loja.</p>
      <button className="btn-primary" onClick={() => { localStorage.setItem('abrirLogin', 'true'); navigate('/'); }}>Fazer Login ou Cadastro</button>
    </div>
  );
  if (carregando) return <p style={{ textAlign: 'center', marginTop: '50px', color: 'var(--muted)' }}>Carregando dados da loja...</p>;

  return (
    <div className="criar-loja-container">
      <div className="criar-loja-card card" style={{ maxWidth: '700px' }}>
        <div className="header-logo">
          <Store size={32} color={corPrincipal} />
          <h2>{lojaExistente ? 'Editar Meu Negócio' : 'Meu Negócio'}</h2>
          <p>{lojaExistente ? 'Atualize os dados da sua loja.' : 'Configure os dados da sua loja para gerar seu link exclusivo.'}</p>
        </div>

        <form onSubmit={salvarLoja}>
          <div className="input-group">
            <label>Nome do Estabelecimento</label>
            <input type="text" value={nomeLoja} onChange={e => { setNomeLoja(e.target.value); gerarSlug(e.target.value); }} placeholder="Ex: Quero1Horario Studio" required />
          </div>

          <div className="input-group">
            <label>Tipo de Negócio</label>
            <select value={nicho} onChange={e => setNicho(e.target.value)} style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', color: 'var(--cream)', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              <option value="barbearia">Barbearia</option>
              <option value="manicure">Manicure / Salão</option>
              <option value="tatuador">Tatuador / Estúdio</option>
              <option value="estetica">Estética / Sobrancelha</option>
              <option value="pet">Pet Shop / Banho e Tosa</option>
            </select>
          </div>

          <div className="input-group">
            <label><MapPin size={14} /> Endereço</label>
            <input type="text" value={endereco} onChange={e => setEndereco(e.target.value)} placeholder="Rua, número, bairro, cidade" />
          </div>

          <div className="input-group">
            <label>Sobre a Loja (Apresentação)</label>
            <textarea value={sobre} onChange={e => setSobre(e.target.value)} placeholder="Conte um pouco sobre sua história..." rows="4" style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: '6px', padding: '14px', color: 'var(--cream)', fontFamily: 'Plus Jakarta Sans, sans-serif', resize: 'vertical' }} />
          </div>

          <div className="input-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}>
              <label><AtSign size={14} /> Instagram (@)</label>
              <input type="text" value={instagram} onChange={e => setInstagram(e.target.value)} placeholder="@sualoja" />
            </div>
            <div className="input-group" style={{ flex: 1 }}>
              <label><Phone size={14} /> WhatsApp</label>
              <input type="tel" value={whatsapp} onChange={handleWhatsApp} placeholder="(11) 99999-9999" />
            </div>
          </div>

          <div className="input-group">
            <label><DollarSign size={14} /> Chave Pix (para receber dos clientes)</label>
            <input type="text" value={chavePix} onChange={e => setChavePix(e.target.value)} placeholder="CPF, e-mail, telefone ou chave aleatória" />
          </div>

          <div className="input-group">
            <label><DollarSign size={14} /> Formas de Pagamento</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'Pix'].map(forma => (
                <button key={forma} type="button" onClick={() => togglePagamento(forma)} className={`btn-forma-pagamento ${formasPagamento.includes(forma) ? 'active' : ''}`}>
                  {forma}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label><LinkIcon size={14} /> Seu Link Exclusivo</label>
            <div className="slug-input-group">
              <span className="slug-prefix">quero1horario.com.br/</span>
              <input type="text" value={slug} onChange={e => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))} required />
            </div>
          </div>

          <div className="input-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}><label><Clock size={14} /> Abertura</label><input type="time" value={abertura} onChange={e => setAbertura(e.target.value)} required /></div>
            <div className="input-group" style={{ flex: 1 }}><label><Clock size={14} /> Fechamento</label><input type="time" value={fechamento} onChange={e => setFechamento(e.target.value)} required /></div>
          </div>

          <div className="input-row" style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
            <div className="input-group" style={{ flex: 1 }}><label><Utensils size={14} /> Início do Almoço</label><input type="time" value={almocoInicio} onChange={e => setAlmocoInicio(e.target.value)} required /></div>
            <div className="input-group" style={{ flex: 1 }}><label><Utensils size={14} /> Fim do Almoço</label><input type="time" value={almocoFim} onChange={e => setAlmocoFim(e.target.value)} required /></div>
          </div>

          <div style={{ padding: '20px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '8px', border: '1px solid var(--border)', marginBottom: '20px' }}>
            <h4 style={{ fontSize: '14px', color: 'var(--primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={16} /> Política de Cancelamento
            </h4>
            
            <div className="input-row" style={{ display: 'flex', gap: '16px', marginBottom: '0' }}>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Prazo Mínimo (Horas)</label>
                <input type="number" min="0" value={prazoCancelamento} onChange={e => setPrazoCancelamento(e.target.value)} placeholder="Ex: 2" />
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>Horas de antecedência.</span>
              </div>
              <div className="input-group" style={{ flex: 1, marginBottom: 0 }}>
                <label>Taxa de Multa (%)</label>
                <input type="number" min="0" max="100" value={taxaCancelamento} onChange={e => setTaxaCancelamento(e.target.value)} placeholder="Ex: 30" />
                <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>0 = isento de multa.</span>
              </div>
            </div>
          </div>

          {/* FOTO DE CAPA COM UPLOAD */}
          <div className="input-group">
            <label><Image size={14} /> Foto de Capa (Banner)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              {fotoCapa && (
                <img src={fotoCapa} alt="Capa" style={{ width: '100px', height: '60px', objectFit: 'cover', borderRadius: '8px' }} />
              )}
              <label className="btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', fontSize: '14px', margin: 0 }}>
                <UploadCloud size={18} /> {enviandoImagem ? 'Enviando...' : 'Escolher Foto'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await uploadImagem(file);
                      if (url) setFotoCapa(url);
                    }
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '4px', display: 'block' }}>Essa foto aparece no topo da página.</span>
          </div>

          {/* FOTO DE PERFIL COM UPLOAD */}
          <div className="input-group">
            <label><Camera size={14} /> Foto de Perfil (Logo)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
              {fotoUrl && (
                <img src={fotoUrl} alt="Perfil" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <label className="btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px', fontSize: '14px', margin: 0 }}>
                <UploadCloud size={18} /> {enviandoImagem ? 'Enviando...' : 'Escolher Foto'}
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const url = await uploadImagem(file);
                      if (url) setFotoUrl(url);
                    }
                  }} 
                  style={{ display: 'none' }} 
                />
              </label>
            </div>
          </div>

          {/* GALERIA COM UPLOAD */}
          {limiteFotos > 0 && (
            <div className="input-group">
              <label><Image size={14} /> Galeria de Fotos ({limiteFotos} fotos)</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '8px' }}>
                {galeria.slice(0, limiteFotos).map((foto, index) => (
                  <div key={index} style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                    {foto ? (
                      <img src={foto} alt={`Galeria ${index}`} style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                    ) : (
                      <div style={{ width: '100%', height: '80px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', color: 'var(--muted)' }}>Vazio</div>
                    )}
                    <label className="btn-outline" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '6px', fontSize: '12px', width: '100%', margin: 0 }}>
                      <UploadCloud size={14} /> Escolher
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const url = await uploadImagem(file);
                            if (url) atualizarGaleria(index, url);
                          }
                        }} 
                        style={{ display: 'none' }} 
                      />
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Comodidades</label>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {['Wi-Fi', 'Estacionamento', 'Acessibilidade', 'Atende Crianças'].map(item => (
                <button key={item} type="button" onClick={() => toggleComodidade(item)} className={`btn-forma-pagamento ${comodidades.includes(item) ? 'active' : ''}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          {planoEscolhido === 'premium' && (
            <div className="input-group">
              <label>Cor Principal da Marca (Premium)</label>
              <input type="color" value={corPrincipal} onChange={e => setCorPrincipal(e.target.value)} style={{ width: '100%', height: '50px', cursor: 'pointer', background: 'transparent', border: '1px solid var(--border)', borderRadius: '6px' }} />
            </div>
          )}

          {!lojaExistente && (
            <div style={{ marginTop: '24px', marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--border)' }}>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', marginBottom: '12px' }}>
                <input type="checkbox" checked={aceitouTermos} onChange={e => setAceitouTermos(e.target.checked)} style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  Li e aceito os <a href="/termos" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Termos de Uso</a> e a <a href="/termos" target="_blank" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>Política de Privacidade</a>.
                </span>
              </label>
              <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer' }}>
                <input type="checkbox" checked={aceitaMarketing} onChange={e => setAceitaMarketing(e.target.checked)} style={{ marginTop: '4px', width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <span style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: '1.5' }}>
                  Desejo receber novidades, dicas e promoções por e-mail.
                </span>
              </label>
            </div>
          )}

          <button type="submit" className="btn-primary full" disabled={salvando || enviandoImagem}>
            {salvando ? 'Salvando...' : (lojaExistente ? 'Salvar Alterações' : 'Salvar Loja e Gerar Link')}
          </button>
        </form>
      </div>
    </div>
  );
}