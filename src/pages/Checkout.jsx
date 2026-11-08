import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { CheckCircle, ShieldCheck, QrCode, ArrowLeft, Clock, ExternalLink } from 'lucide-react';
import './Checkout.css';

export default function Checkout() {
  const [plano, setPlano] = useState('basico');
  const [loja, setLoja] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [usuario, setUsuario] = useState(undefined);
  
  // Estados novos para o Timer
  const [tempoRestante, setTempoRestante] = useState(30 * 60); 
  const [pagamentoIniciado, setPagamentoIniciado] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation(); 

  // LINKS DO MERCADO PAGO
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

  // VERIFICA SE VOLTOU DO MERCADO PAGO COM SUCESSO
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const status = params.get('status');

    if (status === 'sucesso' && usuario) {
      liberarAcessoAutomatico();
    }
  }, [location, usuario]);

  async function liberarAcessoAutomatico() {
    try {
      const docRef = doc(db, "barbearias", usuario.uid);
      
      // Calcula a data de validade (30 dias a partir de hoje)
      const dataValidade = new Date();
      dataValidade.setDate(dataValidade.getDate() + 30);

      await updateDoc(docRef, {
        plano: plano,
        statusPagamento: 'aprovado',
        validadePlano: dataValidade.toISOString() // Salva a data exata
      });

      alert("🎉 Pagamento confirmado! Seu painel foi liberado por 30 dias.");
      navigate('/painel');
    } catch (error) {
      console.error("Erro ao liberar acesso:", error);
    }
  }

  // Lógica do Timer
  useEffect(() => {
    let timer;
    if (pagamentoIniciado && tempoRestante > 0) {
      timer = setInterval(() => {
        setTempoRestante((prev) => prev - 1);
      }, 1000);
    } else if (tempoRestante === 0) {
      setPagamentoIniciado(false);
      alert("⏰ O tempo para pagamento expirou. Gere um novo código.");
    }
    return () => clearInterval(timer);
  }, [pagamentoIniciado, tempoRestante]);

  const formatarTempo = (segundos) => {
    const min = Math.floor(segundos / 60);
    const seg = segundos % 60;
    return `${min.toString().padStart(2, '0')}:${seg.toString().padStart(2, '0')}`;
  };

  function iniciarPagamento() {
    setPagamentoIniciado(true);
    setTempoRestante(30 * 60); 
    window.open(LINKS_MERCADO_PAGO[plano], '_blank');
  }

  // Envia para o admin aprovar (Plano B)
  async function enviarParaAprovacao() {
    if (!usuario) return;
    try {
      const docRef = doc(db, "barbearias", usuario.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        await setDoc(docRef, {
          nome: "Minha Loja",
          donoId: usuario.uid,
          donoEmail: usuario.email,
          plano: plano,
          statusPagamento: 'pendente_aprovacao',
          criadoEm: new Date()
        });
      } else {
        await updateDoc(docRef, { 
          statusPagamento: 'pendente_aprovacao',
          plano: plano 
        });
      }

      alert("✅ Solicitação enviada!\n\nAguarde a confirmação do administrador.");
      navigate('/painel'); 
    } catch (error) {
      console.error("Erro ao enviar solicitação:", error);
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

        {!pagamentoIniciado ? (
          <div className="pagamento-opcoes">
            <h3>Como deseja pagar?</h3>
            <button onClick={iniciarPagamento} className="btn-pagamento mercadopago">
              <ExternalLink size={20} />
              Pagar com Mercado Pago (Pix ou Cartão)
            </button>
            <p className="aviso-seguranca" style={{ marginTop: '20px', color: 'var(--muted)', fontSize: '13px' }}>
              Ao clicar, você será redirecionado para o ambiente seguro do Mercado Pago. Após o pagamento, você voltará automaticamente.
            </p>
          </div>
        ) : (
          <div className="aguardando-pagamento" style={{ textAlign: 'center', padding: '20px 0' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '10px' }}>Aguardando Pagamento</h3>
            
            <div className="timer-box" style={{ 
              background: 'rgba(59, 130, 246, 0.1)', 
              padding: '20px', 
              borderRadius: '12px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              gap: '10px',
              marginBottom: '20px' 
            }}>
              <Clock size={24} color="var(--primary)" />
              <span style={{ fontSize: '32px', fontWeight: 'bold', color: 'var(--cream)', fontFamily: 'monospace' }}>
                {formatarTempo(tempoRestante)}
              </span>
            </div>

            <p style={{ color: 'var(--muted)', fontSize: '13px', marginBottom: '20px' }}>
              O tempo para realizar o pagamento está correndo. <br/>
              Se você já realizou o Pix, clique no botão abaixo.
            </p>

            <button onClick={enviarParaAprovacao} className="btn-pagamento simular" style={{ background: 'var(--success)', color: 'white' }}>
              <CheckCircle size={20} />
              Já fiz o Pagamento (Aguardar Aprovação)
            </button>

            <button 
              onClick={() => setPagamentoIniciado(false)} 
              style={{ background: 'none', border: 'none', color: 'var(--muted)', marginTop: '15px', cursor: 'pointer', textDecoration: 'underline', fontSize: '13px' }}
            >
              Cancelar e voltar
            </button>
          </div>
        )}

        <p className="aviso-seguranca">
          <CheckCircle size={14} /> Pagamento 100% seguro. Sua loja será liberada após a confirmação.
        </p>
      </div>
    </div>
  );
}