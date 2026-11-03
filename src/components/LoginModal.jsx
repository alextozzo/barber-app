import { X } from 'lucide-react';
import { useState } from 'react';
import { auth, db } from '../firebase'; 
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './LoginModal.css';

export default function LoginModal({ onClose }) {
  const [mode, setMode] = useState('login');
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setErro('');
    setCarregando(true);

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
          email: email,
          criadoEm: new Date()
        });
      }
      
      localStorage.setItem('logado', 'true');

      const intencao = localStorage.getItem('intencao');
      
      if (intencao === 'profissional') {
        localStorage.removeItem('intencao');
        onClose(); 
        
        // Verifica a loja
        const lojaRef = doc(db, "barbearias", userCredential.user.uid);
        const lojaSnap = await getDoc(lojaRef);

        setTimeout(() => {
          if (lojaSnap.exists()) {
            const dadosLoja = lojaSnap.data();
            if (dadosLoja.statusPagamento === 'ativo') {
              navigate('/painel'); // Já pagou, vai pro painel
            } else {
              navigate('/checkout'); // Não pagou, vai pro checkout
            }
          } else {
            navigate('/criar-loja'); // Não tem loja, vai criar
          }
        }, 500);

      } else {
        onClose(); 
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
                  onChange={e => setTelefone(e.target.value)} 
                  placeholder="(11) 99999-9999" 
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