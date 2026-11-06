import { X } from 'lucide-react';
import { useState } from 'react';
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate, useLocation } from 'react-router-dom';
import './LoginModal.css';

export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  function handleTelefone(e) {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);
    
    if (value.length <= 10) {
      value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    } else {
      value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }
    
    setTelefone(value);
  }

  function validarTelefone(tel) {
    const numeros = tel.replace(/\D/g, '');
    return numeros.length >= 10 && numeros.length <= 11;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    if (mode === 'register' && !validarTelefone(telefone)) {
      setErro('Telefone inválido. Digite DDD + número (ex: 11999999999).');
      setCarregando(false);
      return;
    }

    if (password.length < 6) {
      setErro('A senha deve ter pelo menos 6 caracteres.');
      setCarregando(false);
      return;
    }

    try {
      let userCredential;
      
      if (mode === 'login') {
        userCredential = await signInWithEmailAndPassword(auth, email, password);
      } else {
        userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: nome });
        await setDoc(doc(db, "clientes", userCredential.user.uid), {
          nome: nome,
          telefone: telefone,
          dataNascimento: dataNascimento,
          email: email,
          criadoEm: new Date()
        });
      }
      
      localStorage.setItem('logado', 'true');

      const intencao = localStorage.getItem('intencao');
      
      // --- LÓGICA DE REDIRECIONAMENTO ---
      const lojaRef = doc(db, "barbearias", userCredential.user.uid);
      const lojaSnap = await getDoc(lojaRef);

      if (lojaSnap.exists()) {
        // Usuário já tem loja (é profissional). Vai para painel ou checkout.
        const dadosLoja = lojaSnap.data();
        localStorage.removeItem('intencao');
        onClose();
        
        setTimeout(() => {
          if (dadosLoja.statusPagamento === 'ativo') {
            navigate('/painel');
          } else {
            navigate('/checkout');
          }
        }, 500);

      } else if (intencao === 'profissional') {
        // Profissional novo (não tem loja). Vai para criar loja.
        localStorage.removeItem('intencao');
        onClose();
        setTimeout(() => {
          navigate('/criar-loja');
        }, 500);

      } else {
        // CLIENTE: Apenas fecha o modal. Se estava na página da loja, continua lá.
        onClose();
        // O cliente permanece na página atual (ex: /slug-da-loja) e pode clicar em Agendar de novo.
      }

    } catch (error) {
      console.error(error);
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setErro('E-mail ou senha incorretos.');
      } else if (error.code === 'auth/email-already-in-use') {
        setErro('E-mail já cadastrado.');
      } else if (error.code === 'auth/weak-password') {
        setErro('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setErro('Erro ao processar. Tente novamente.');
      }
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><X size={22} /></button>

        <h2>{mode === 'login' ? 'Bem-vindo de volta' : 'Crie sua conta'}</h2>
        
        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="field">
                <label>Nome Completo</label>
                <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome" required />
              </div>
              <div className="field">
                <label>Telefone (WhatsApp)</label>
                <input 
                  type="tel" 
                  value={telefone} 
                  onChange={handleTelefone} 
                  placeholder="(11) 99999-9999" 
                  maxLength="15"
                  required 
                />
              </div>
              <div className="field">
                <label>Data de Nascimento</label>
                <input 
                  type="date" 
                  value={dataNascimento} 
                  onChange={e => setDataNascimento(e.target.value)} 
                  required 
                />
              </div>
            </>
          )}

          <div className="field">
            <label>E-mail</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
          </div>

          <div className="field">
            <label>Senha</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>

          {erro && <p style={{ color: '#ff6b6b', fontSize: '13px', marginBottom: '10px' }}>{erro}</p>}

          <button type="submit" className="btn-primary full" disabled={carregando}>
            {carregando ? 'Aguarde...' : (mode === 'login' ? 'Entrar' : 'Criar Conta')}
          </button>
        </form>

        <div className="switch-mode">
          {mode === 'login' ? 'Não tem conta? ' : 'Já tem conta? '}
          <button type="button" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setErro(''); }}>
            {mode === 'login' ? 'Cadastre-se' : 'Entrar'}
          </button>
        </div>
      </div>
    </div>
  );
}