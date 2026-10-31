import { useState } from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import BarberCard from '../components/BarberCard';
import BookingModal from '../components/BookingModal';
import LoginModal from '../components/LoginModal';

export default function Home() {
  const [selectedBarber, setSelectedBarber] = useState(null);
  const [loginOpen, setLoginOpen] = useState(false);

  const barbers = [
    {
       id: "dDAwJbzmO8VG0VgvFaJl3cojwHP2",
      name: 'Rafael Andrade',
      title: 'Master Barber',
      photo: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
      rating: 4.9,
      reviews: 128,
      specialties: ['Degradê', 'Navalha', 'Barba'],
    },
    {
      id: 2,
      name: 'Carlos Menezes',
      title: 'Barber Sênior',
      photo: 'https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400',
      rating: 4.8,
      reviews: 96,
      specialties: ['Clássico', 'Pompadour'],
    },
    {
      id: 3,
      name: 'Diego Rocha',
      title: 'Especialista em Barba',
      photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400',
      rating: 5.0,
      reviews: 87,
      specialties: ['Barba', 'Toalha Quente'],
    },
  ];

  return (
    <>
      <Navbar 
        onLoginClick={() => setLoginOpen(true)} 
        onBookClick={() => setSelectedBarber(barbers[0])} 
      />
      
      <Hero onBookClick={() => setSelectedBarber(barbers[0])} />

      <section className="barbers-section" id="barbeiros">
        <div className="section-header">
          <span className="section-tagline">— Nossos Mestres —</span>
          <h2>Escolha seu <em>Barbeiro</em></h2>
        </div>

        <div className="barbers-grid">
          {barbers.map(b => (
            <BarberCard key={b.id} barber={b} onSelect={setSelectedBarber} />
          ))}
        </div>
      </section>

      {/* Modal de Agendamento */}
      {selectedBarber && (
        <BookingModal 
          barber={selectedBarber} 
          onClose={() => setSelectedBarber(null)} 
          onAskLogin={() => setLoginOpen(true)} // <-- ESTA É A LINHA NOVA
        />
      )}

      {/* Modal de Login */}
      {loginOpen && (
        <LoginModal onClose={() => setLoginOpen(false)} />
      )}

      <style>{`
        .barbers-section {
          max-width: 1200px;
          margin: 0 auto;
          padding: 80px 24px;
        }
        .section-header {
          text-align: center;
          margin-bottom: 60px;
        }
        .section-tagline {
          color: var(--gold);
          font-size: 13px;
          letter-spacing: 4px;
          text-transform: uppercase;
        }
        .section-header h2 {
          font-size: 48px;
          margin-top: 16px;
        }
        .section-header h2 em {
          color: var(--gold);
          font-style: italic;
        }
        .barbers-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 28px;
        }
      `}</style>
    </>
  );
}