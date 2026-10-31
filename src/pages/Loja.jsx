import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Store, Star, Clock, Scissors } from 'lucide-react';
import BookingModal from '../components/BookingModal';
import LoginModal from '../components/LoginModal';
import './Loja.css';

export default function Loja() {
  const { slug } = useParams(); // Pega o link (ex: rafael-andrade)
  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);
  const [user, setUser] = useState(undefined);

  // Verifica o login do cliente
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Busca a loja pelo link (slug) no Firebase
  useEffect(() => {
    async function buscarLoja() {
      try {
        const q = query(collection(db, "barbearias"), where("slug", "==", slug));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const dadosLoja = { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
          setLoja(dadosLoja);
        } else {
          setErro("Barbearia não encontrada. Verifique o link.");
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
        setErro("Erro ao carregar a barbearia.");
      } finally {
        setCarregando(false);
      }
    }
    buscarLoja();
  }, [slug]);

  if (carregando) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--gold)' }}>Carregando...</div>;
  if (erro) return <div style={{ padding: '50px', textAlign: 'center', color: 'var(--danger)' }}>{erro}</div>;
  if (!loja) return null;

  // Aqui montamos o "barbeiro" falso que o BookingModal espera
  const barbeiro = {
    id: loja.donoId,
    name: loja.nome,
    title: 'Barbeiro',
    photo: loja.fotoUrl || 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
    rating: 5.0,
    reviews: 0,
    specialties: ['Corte', 'Barba'],
    horarios: loja.horarios || ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00', '17:00', '18:00'],
    dias: loja.dias || [1, 2, 3, 4, 5, 6] // Segunda a sábado
  };

  return (
    <>
      <nav className="navbar-loja">
        <div className="nav-container">
          <Link to="/" className="logo">
            <Store size={24} color="#C9A961" />
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
              <Star size={16} fill="#C9A961" color="#C9A961" />
              <span>{barbeiro.rating}</span>
              <span className="reviews">(novo no app)</span>
            </div>
            <p>Especialidades: {barbeiro.specialties.join(', ')}</p>
          </div>
          <button className="btn-primary" onClick={() => setSelectedBarber(barbeiro)}>
            Agendar Horário
          </button>
        </div>

        <div className="loja-servicos">
          <h2>Serviços Disponíveis</h2>
          <p style={{ color: 'var(--muted)' }}>Clique em agendar para escolher o serviço, data e horário.</p>
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