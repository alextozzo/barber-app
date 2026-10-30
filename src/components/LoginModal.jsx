import { X } from 'lucide-react';
import { useState } from 'react';
import './LoginModal.css';

export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    alert(`${mode === 'login' ? 'Login' : 'Cadastro'} realizado!\nE-mail: ${email}`);
    onClose();
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={22} /></button>

        <h2>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        <p className="subtitle">
          {mode === 'login' 
            ? 'Acesse para agendar seu próximo corte' 
            : 'Cadastre-se e agende seu primeiro horário'}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input 
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className="btn-primary full">
            {mode === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="switch-mode">
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}