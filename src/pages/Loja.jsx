import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Store, Star, MapPin, Phone, AtSign, Clock, CreditCard, DollarSign, Wifi, Car, Accessibility, Baby, Scissors, CheckCircle } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import LoginModal from '../components/LoginModal';
import './Loja.css';

export default function Loja() {
  const { slug } = useParams(); 
  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [loginMode, setLoginMode] = useState('login');
  const [user, setUser] = useState(undefined);
  const [abaAtiva, setAbaAtiva] = useState('servicos');
  const [mediaAvaliacao, setMediaAvaliacao] = useState(5.0);
  const [totalAvaliacoes, setTotalAvaliacoes] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function buscarLoja() {
      try {
        const q = query(collection(db, "barbearias"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const dadosLoja = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
          
          if (dadosLoja.statusPagamento !== 'ativo' && dadosLoja.statusPagamento !== 'aprovado') {
            setErro("Esta página está temporariamente indisponível. O profissional precisa regularizar a assinatura.");
            setCarregando(false);
            return;
          }

          setLoja(dadosLoja);
        } else {
          setErro("Estabelecimento não encontrado. Verifique o link.");
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
        setErro("Erro ao carregar o estabelecimento.");
      } finally {
        setCarregando(false);
      }
    }
    buscarLoja();
  }, [slug]);

  useEffect(() => {
    const corFinal = loja?.corPrincipal || '#3B82F6'; 
    document.documentElement.style.setProperty('--primary', corFinal);
    document.documentElement.style.setProperty('--gold', corFinal);
  }, [loja]);

  useEffect(() => {
    async function calcularMedia() {
      if (!loja) return;
      const q = query(
        collection(db, "agendamentos"), 
        where("barbeiroId", "==", loja.donoId),
        where("avaliacao", "!=", null)
      );
      const snapshot = await getDocs(q);
      const avaliacoes = [];
      snapshot.forEach(doc => avaliacoes.push(doc.data().avaliacao));
      
      if (avaliacoes.length > 0) {
        const soma = avaliacoes.reduce((acc, nota) => acc + nota, 0);
        setMediaAvaliacao(soma / avaliacoes.length);
        setTotalAvaliacoes(avaliacoes.length);
      }
    }
    calcularMedia();
  }, [loja]);

  if (carregando) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--primary)' }}>Carregando...</div>;
  if (erro) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--danger)' }}>{erro}</div>;
  if (!loja) return null;

  const especialidades = loja.nicho === 'barbearia' ? ['Corte', 'Barba'] : 
                         loja.nicho === 'manicure' ? ['Manicure', 'Pedicure'] : 
                         loja.nicho === 'tatuador' ? ['Tatuagem', 'Piercing'] : 
                         loja.nicho === 'estetica' ? ['Estética', 'Sobrancelha'] :
                         loja.nicho === 'pet' ? ['Banho', 'Tosa'] : ['Serviços'];

  const barbeiro = {
    id: loja.donoId,
    name: loja.nome,
    title: loja.nicho || 'Profissional',
    photo: loja.fotoUrl || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    rating: mediaAvaliacao,
    reviews: totalAvaliacoes,
    specialties: especialidades,
    abertura: loja.abertura || '09:00',
    fechamento: loja.fechamento || '19:00',
    almocoInicio: loja.almocoInicio || '12:00',
    almocoFim: loja.almocoFim || '13:00'
  };

  const galeriaExemplo = [
    'https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=600',
    'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=600',
    'https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600',
  ];

  const limiteFotos = loja.plano === 'premium' ? 5 : loja.plano === 'pro' ? 3 : 0;
  const fotosReais = (loja.galeria || []).filter(f => f).slice(0, limiteFotos);
  const fotosParaExibir = limiteFotos === 0 
    ? [] 
    : (fotosReais.length > 0 ? fotosReais : galeriaExemplo.slice(0, limiteFotos));

  const comodidadesParaExibir = (loja.comodidades && loja.comodidades.length > 0)
    ? loja.comodidades
    : ['Wi-Fi', 'Estacionamento', 'Acessibilidade'];

  return (
    <>
      <nav className="navbar-loja">
        <div className="nav-container">
          <Link to="/" className="logo">
            <Store size={24} color="var(--primary)" />
            <span>VOLTAR PARA O INÍCIO</span>
          </Link>
          <div className="nav-actions">
            {user ? (
              <span style={{ color: 'var(--cream)', fontSize: '14px' }}>Olá, {user.displayName}</span>
            ) : (
              <>
                <button 
                  className="btn-outline" 
                  onClick={() => { 
                    setLoginMode('login'); 
                    setLoginOpen(true); 
                  }}
                >
                  Entrar
                </button>
                <button 
                  className="btn-primary" 
                  onClick={() => { 
                    setLoginMode('register'); 
                    setLoginOpen(true); 
                  }}
                  style={{ marginLeft: '8px' }}
                >
                  Criar Conta
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="loja-main">
        {/* HEADER COM BANNER E FOTO SOBREPOSTA */}
        <div className="loja-header">
          <div className="loja-banner-bg" style={{ backgroundImage: `linear-gradient(to right, ${loja.corPrincipal || '#3B82F6'}, #111)` }}></div>
          <div className="loja-header-content">
            <div className="loja-avatar">
              <img src={barbeiro.photo} alt={loja.nome} />
            </div>
            <div className="loja-info">
              <h1>{loja.nome}</h1>
              <div className="rating">
                <Star size={16} fill="var(--primary)" color="var(--primary)" />
                <span>{mediaAvaliacao.toFixed(1)}</span>
                <span className="reviews">({totalAvaliacoes} avaliações)</span>
              </div>
              <p>Especialidades: {barbeiro.specialties.join(', ')}</p>
            </div>
            <button 
              className="btn-primary" 
              onClick={() => setSelectedBarber(barbeiro)}
              style={{ padding: '14px 32px', fontSize: '16px', borderRadius: '8px', boxShadow: '0 4px 14px rgba(59, 130, 246, 0.4)' }}
            >
              Agendar Horário
            </button>
          </div>
        </div>

        {fotosParaExibir.length > 0 && (
          <div className="loja-galeria">
            {fotosParaExibir.map((foto, index) => (
              <img key={index} src={foto} alt={`Foto ${index + 1}`} className="galeria-img" />
            ))}
          </div>
        )}

        {loja.sobre && (
          <div className="loja-sobre card">
            <h3>Sobre o Estabelecimento</h3>
            <p>{loja.sobre}</p>
          </div>
        )}

        <div className="loja-como-agendar card">
          <h3>Como Agendar</h3>
          <div className="passos-agendar">
            <div className="passo-item">
              <div className="passo-numero">1</div>
              <div>
                <h4>Escolha o Serviço</h4>
                <p>Clique em "Agendar Horário" e selecione o serviço desejado.</p>
              </div>
            </div>
            <div className="passo-item">
              <div className="passo-numero">2</div>
              <div>
                <h4>Escolha Data e Hora</h4>
                <p>Selecione o melhor dia e horário para você.</p>
              </div>
            </div>
            <div className="passo-item">
              <div className="passo-numero">3</div>
              <div>
                <h4>Confirme seu Horário</h4>
                <p>Se preferir, realize o pagamento antecipado via Pix. Caso contrário, pague no local no dia do atendimento.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="loja-comodidades card">
          <h3>Comodidades</h3>
          <div className="comodidades-grid">
            {comodidadesParaExibir.map((item, index) => (
              <div key={index} className="comodidade-item">
                {item === 'Wi-Fi' && <Wifi size={20} color="var(--primary)" />}
                {item === 'Estacionamento' && <Car size={20} color="var(--primary)" />}
                {item === 'Acessibilidade' && <Accessibility size={20} color="var(--primary)" />}
                {item === 'Atende Crianças' && <Baby size={20} color="var(--primary)" />}
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="loja-abas">
          <button className={`aba-btn ${abaAtiva === 'servicos' ? 'active' : ''}`} onClick={() => setAbaAtiva('servicos')}>
            Serviços
          </button>
          <button className={`aba-btn ${abaAtiva === 'profissionais' ? 'active' : ''}`} onClick={() => setAbaAtiva('profissionais')}>
            Profissionais
          </button>
          <button className={`aba-btn ${abaAtiva === 'avaliacoes' ? 'active' : ''}`} onClick={() => setAbaAtiva('avaliacoes')}>
            Avaliações
          </button>
        </div>

        <div className="loja-conteudo">
          {abaAtiva === 'servicos' && (
            <div className="servicos-lista">
              <h3>Serviços Disponíveis</h3>
              <p style={{ color: 'var(--muted)', marginBottom: '20px' }}>Clique em "Agendar Horário" para escolher o serviço e ver os horários.</p>
            </div>
          )}
          {abaAtiva === 'profissionais' && (
            <div className="profissionais-lista">
              <h3>Nossa Equipe</h3>
              <p style={{ color: 'var(--muted)' }}>Em breve, a lista de profissionais aparecerá aqui.</p>
            </div>
          )}
          {abaAtiva === 'avaliacoes' && (
            <div className="avaliacoes-lista">
              <h3>Avaliações dos Clientes</h3>
              <p style={{ color: 'var(--muted)' }}>As avaliações aparecerão aqui após os atendimentos.</p>
            </div>
          )}
        </div>

        <div className="loja-info-grid">
          {loja.endereco && (
            <div className="info-card card">
              <div className="info-icon"><MapPin size={20} /></div>
              <div>
                <h4>Localização</h4>
                <p>{loja.endereco}</p>
              </div>
            </div>
          )}
          {loja.whatsapp && (
            <div className="info-card card">
              <div className="info-icon"><Phone size={20} /></div>
              <div>
                <h4>WhatsApp</h4>
                <a href={`https://wa.me/55${loja.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                  {loja.whatsapp}
                </a>
              </div>
            </div>
          )}
          {loja.instagram && (
            <div className="info-card card">
              <div className="info-icon"><AtSign size={20} /></div>
              <div>
                <h4>Instagram</h4>
                <a href={`https://instagram.com/${loja.instagram.replace('@', '')}`} target="_blank" rel="noreferrer">
                  {loja.instagram}
                </a>
              </div>
            </div>
          )}
          {loja.chavePix && (
            <div className="info-card card">
              <div className="info-icon"><DollarSign size={20} /></div>
              <div>
                <h4>Chave Pix</h4>
                <p>{loja.chavePix}</p>
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(loja.chavePix);
                    alert('Chave Pix copiada!');
                  }}
                  style={{ background: 'none', color: 'var(--primary)', fontSize: '12px', marginTop: '4px', padding: 0, textDecoration: 'underline' }}
                >
                  Copiar chave
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="loja-detalhes-grid">
          <div className="detalhes-card card">
            <h3><Clock size={18} /> Horário de Atendimento</h3>
            <div className="horario-linha">
              <span>Segunda a Sábado</span>
              <strong>{loja.abertura} - {loja.fechamento}</strong>
            </div>
            <div className="horario-linha">
              <span>Almoço</span>
              <strong>{loja.almocoInicio} - {loja.almocoFim}</strong>
            </div>
          </div>

          <div className="detalhes-card card">
            <h3><CreditCard size={18} /> Formas de Pagamento</h3>
            <div className="pagamento-tags">
              {loja.formasPagamento && loja.formasPagamento.length > 0 ? (
                loja.formasPagamento.map(forma => (
                  <span key={forma} className="pagamento-tag">{forma}</span>
                ))
              ) : (
                <p style={{ color: 'var(--muted)' }}>Não informado.</p>
              )}
            </div>
          </div>
        </div>

        <div className="banner-marketing card">
          <div className="banner-content">
            <h3>Você também é profissional da beleza?</h3>
            <p>Crie sua página exclusiva, receba agendamentos no WhatsApp e fidelize seus clientes.</p>
          </div>
          <a href="/planos" className="btn-primary">
            Criar Minha Loja Grátis
          </a>
        </div>
      </main>

      {selectedBarber && (
        <BookingModal 
          barber={selectedBarber} 
          onClose={() => setSelectedBarber(null)} 
          onAskLogin={() => { 
            setSelectedBarber(null);
            setLoginMode('login');
            setLoginOpen(true); 
          }} 
        />
      )}

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} initialMode={loginMode} />
      )}
    </>
  );
}