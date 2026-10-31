import { useNavigate, Link } from 'react-router-dom';
import { Check, Scissors, Crown, Zap } from 'lucide-react';
import './Planos.css';

export default function Planos() {
  const navigate = useNavigate();

  const planos = [
    {
      id: 'basico',
      nome: 'Plano Básico',
      preco: '29',
      descricao: 'Para quem está começando a organizar a agenda.',
      icone: <Scissors size={24} />,
      features: [
        'Link exclusivo para bio do Instagram',
        'Agendamento online 24h',
        'Cadastro de até 5 serviços',
        'Painel de controle simples',
        'Notificação no WhatsApp'
      ]
    },
    {
      id: 'pro',
      nome: 'Plano Pro',
      preco: '49',
      descricao: 'Para barbearias que querem crescer e fidelizar.',
      icone: <Zap size={24} />,
      destaque: true,
      features: [
        'Tudo do Plano Básico',
        'Serviços ilimitados',
        'Gestão de clientes e histórico',
        'Relatórios de faturamento',
        'Bloqueio automático de horários',
        'Suporte prioritário'
      ]
    },
    {
      id: 'premium',
      nome: 'Plano Premium',
      preco: '79',
      descricao: 'Para barbearias com múltiplos profissionais.',
      icone: <Crown size={24} />,
      features: [
        'Tudo do Plano Pro',
        'Múltiplos barbeiros na mesma loja',
        'Gestão de comissões',
        'Pagamento antecipado (sinal)',
        'Página personalizada com sua marca'
      ]
    }
  ];

  function escolherPlano(planoId) {
    localStorage.setItem('planoEscolhido', planoId);
    alert(`Você escolheu o plano ${planoId.toUpperCase()}. Faça login para continuar!`);
    navigate('/?login=true'); // <-- REDIRECIONA PARA A HOME COM O LOGIN ABERTO
  }

  return (
    <div className="planos-container">
      <header className="planos-header">
        <Link to="/" className="logo-voltar">← Voltar</Link>
        <span className="tagline">— Escolha seu Plano —</span>
        <h1>Invista no crescimento da sua <em>barbearia</em></h1>
        <p>Cancele quando quiser. Sem taxa de adesão. Sem porcentagem nas vendas.</p>
      </header>

      <div className="planos-grid">
        {planos.map((plano) => (
          <div key={plano.id} className={`plano-card card ${plano.destaque ? 'destaque' : ''}`}>
            {plano.destaque && <div className="badge-destaque">Mais Popular</div>}
            
            <div className="plano-icone">{plano.icone}</div>
            <h3>{plano.nome}</h3>
            <p className="plano-desc">{plano.descricao}</p>
            
            <div className="plano-preco">
              <span>R$</span>
              <strong>{plano.preco}</strong>
              <span>/mês</span>
            </div>

            <ul className="plano-features">
              {plano.features.map((feature, index) => (
                <li key={index}>
                  <Check size={16} color="var(--gold)" /> {feature}
                </li>
              ))}
            </ul>

            <button 
              className={`btn-primary full ${plano.destaque ? '' : 'btn-outline'}`}
              onClick={() => escolherPlano(plano.id)}
            >
              Começar Agora
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}