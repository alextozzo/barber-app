import { Star } from 'lucide-react';
import './BarberCard.css';

export default function BarberCard({ barber, onSelect }) {
  return (
    <div className="barber-card card">
      <div className="barber-avatar">
        <img src={barber.photo} alt={barber.name} />
        <span className="gold-border"></span>
      </div>
      <div className="barber-info">
        <h3>{barber.name}</h3>
        <p className="barber-title">{barber.title}</p>
        <div className="rating">
          <Star size={14} fill="#C9A961" color="#C9A961" />
          <span>{barber.rating}</span>
          <span className="reviews">({barber.reviews} avaliações)</span>
        </div>
        <div className="specs">
          {barber.specialties.map(s => (
            <span key={s} className="tag">{s}</span>
          ))}
        </div>
        <button className="btn-primary full" onClick={() => onSelect(barber)}>
          Agendar com {barber.name.split(' ')[0]}
        </button>
      </div>
    </div>
  );
}