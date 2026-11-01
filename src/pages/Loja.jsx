import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Store, Star } from 'lucide-react';
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
  const [user, setUser] = useState(undefined);

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
    if (loja && loja.corPrincipal) {
      document.documentElement.style.setProperty('--gold', loja.corPrincipal);
    } else {
      document.documentElement.style.setProperty('--gold', '#C9A961');
    }
  }, [loja]);

  if (carregando) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--gold)' }}>Carregando...</div>;
  if (erro) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--danger)' }}>{erro}</div>;
  if (!loja) return null;

  // Define as especialidades baseadas no nicho
  const especialidades = loja.nicho === 'barbearia' ? ['Corte', 'Barba'] : 
                         loja.nicho === 'manicure' ? ['Manicure', 'Pedicure'] : 
                         loja.nicho === 'tatuador' ? ['Tatuagem', 'Piercing'] : 
                         loja.nicho === 'estetica' ? ['Estética', 'Sobrancelha'] :
                         loja.nicho === 'pet' ? ['Banho', 'Tosa'] : ['Serviços'];

  // Objeto "barbeiro" completo para o BookingModal
  const barbeiro = {
    id: loja.donoId,
    name: loja.nome,
    title: loja.nicho || 'Profissional',
    photo: loja.fotoUrl || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    rating: 5.0,
    reviews: 0,
    specialties: especialidades, // Usando a variável correta
    abertura: loja.abertura || '09:00',
    fechamento: loja.fechamento || '19:00',
    almocoInicio: loja.almocoInicio || '12:00',
    almocoFim: loja.almocoFim || '13:00'
  };

  return (
    <>
      <nav className="navbar-loja">
        <div className="nav-container">
          <Link to="/" className="logo">
            <Store size={24} color="var(--gold)" />
            <span>VOLTAR PARA O INÍCIO</span>
          </Link>
          <div className="nav-actions">
            {user ? (
              <span style={{ color: 'var(--cream)', fontSize: '14px' }}>Olá, {user.displayName}</span>
            ) : (
              <button className="btn-outline" onClick={() => setLoginOpen(true)}>Entrar</button>
            )}
          </div>
        </div>
      </nav>

      <main className="loja-main">
        <div className="loja-header card">
          <div className="loja-avatar">
            <img src={barbeiro.photo} alt={loja.nome} />
          </div>
          <div className="loja-info">
            <h1>{loja.nome}</h1>
            <div className="rating">
              <Star size={16} fill="var(--gold)" color="var(--gold)" />
              <span>{barbeiro.rating}</span>
              <span className="reviews">(novo no app)</span>
            </div>
            <p style={{ textTransform: 'capitalize' }}>Especialidades: {barbeiro.specialties.join(', ')}</p>
          </div>
          <button className="btn-primary" onClick={() => setSelectedBarber(barbeiro)}>
            Agendar Horário
          </button>
        </div>

        <div className="loja-servicos">
          <h2>Serviços Disponíveis</h2>
          <p style={{ color: 'var(--muted)' }}>Clique em agendar para escolher o serviço, data e horário.</p>
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
          onAskLogin={() => setLoginOpen(true)}
        />
      )}

      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}
    </>
  );
}