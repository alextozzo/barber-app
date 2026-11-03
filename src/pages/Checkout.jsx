import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { CheckCircle, ShieldCheck, QrCode, ArrowLeft } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const [plano, setPlano] = useState('basico');
  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(undefined);
  const navigate = useNavigate();

  // LINKS DO MERCADO PAGO (já preenchidos)
  const LINKS_MERCADO_PAGO = {
    basico: 'https://mpago.la/2nmH9UF',
    pro: 'https://mpago.la/182JXdi',
    premium: 'https://mpago.la/28SSsBf'
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchDados() {
      if (!usuario) {
        setCarregando(false);
        return;
      }

      const planoSalvo = localStorage.getItem('planoEscolhido') || 'basico';
      setPlano(planoSalvo);

      try {
        const docRef = doc(db, "barbearias", usuario.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setLoja(docSnap.data());
        }
      } catch (error) {
        console.error("Erro ao buscar loja:", error);
      } finally {
        setCarregando(false);
      }
    }
    fetchDados();
  }, [usuario]);

  // Função para simular a aprovação do pagamento (enquanto o webhook não chega)
  async function simularPagamento() {
    if (!usuario) return;
    try {
      const docRef = doc(db, "barbearias", usuario.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nome: "Minha Loja",
          donoId: usuario.uid,
          donoEmail: usuario.email,
          statusPagamento: 'pendente',
          criadoEm: new Date()
        });
      } else {
        await updateDoc(docRef, { statusPagamento: 'pendente' });
      }

      alert("✅ Pagamento enviado para análise!\n\nAssim que for aprovado, sua loja será liberada.");
      navigate('/painel'); 
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      alert("Erro ao registrar pagamento. Tente novamente.");
    }
  }

  const precos = { basico: '29,90', pro: '49,90', premium: '79,90' };

  if (carregando) return <p style={{ padding: '50px', textAlign: 'center', color: 'var(--primary)' }}>Carregando...</p>;
  if (!usuario) return <p style={{ padding: '50px', textAlign: 'center', color: 'var(--danger)' }}>Faça login para continuar.</p>;

  return (
    <div className="checkout-container">
      <div className="checkout-card card">
        <Link to="/criar-loja" className="voltar-link">
          <ArrowLeft size={16} /> Voltar para a loja
        </Link>

        <header className="checkout-header">
          <ShieldCheck size={40} color="var(--primary)" />
          <h1>Finalizar Assinatura</h1>
          <p>Você está a um passo de colocar sua loja no ar.</p>
        </header>

        <div className="resumo-pedido">
          <div className="resumo-row">
            <span>Plano Escolhido</span>
            <strong style={{ textTransform: 'capitalize' }}>{plano}</strong>
          </div>
          <div className="resumo-row">
            <span>Estabelecimento</span>
            <strong>{loja?.nome || 'Sua Loja'}</strong>
          </div>
          <div className="resumo-row total">
            <span>Total Mensal</span>
            <strong>R$ {precos[plano]}</strong>
          </div>
        </div>

        <div className="pagamento-opcoes">
          <h3>Como deseja pagar?</h3>
          
          <a 
            href={LINKS_MERCADO_PAGO[plano]} 
            target="_blank" 
            rel="noreferrer" 
            className="btn-pagamento mercadopago"
          >
            Pagar com Mercado Pago (Pix ou Cartão)
          </a>

          <div className="divider">ou</div>

          <button onClick={simularPagamento} className="btn-pagamento simular">
            <QrCode size={20} />
            Já fiz o Pix (Aguardar Aprovação)
          </button>
        </div>

        <p className="aviso-seguranca">
          <CheckCircle size={14} /> Pagamento 100% seguro. Sua loja será liberada após a confirmação.
        </p>
      </div>
    </div>
  );
}