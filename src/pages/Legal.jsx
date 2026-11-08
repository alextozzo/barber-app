import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import './Legal.css';

export default function Legal() {
  const [abaAtiva, setAbaAtiva] = useState('termos');

  return (
    <div className="legal-container">
      <div className="legal-card card">
        
        <Link to="/" className="voltar-link">
          <ArrowLeft size={16} /> Voltar para o início
        </Link>

        <header className="legal-header">
          <ShieldCheck size={40} color="var(--primary)" />
          <h1>Documentos Legais</h1>
          <p>Leia atentamente os termos e políticas da plataforma.</p>
        </header>

        <div className="legal-tabs">
          <button 
            className={abaAtiva === 'termos' ? 'active' : ''} 
            onClick={() => setAbaAtiva('termos')}
          >
            <FileText size={18} /> Termos de Uso
          </button>
          <button 
            className={abaAtiva === 'privacidade' ? 'active' : ''} 
            onClick={() => setAbaAtiva('privacidade')}
          >
            <ShieldCheck size={18} /> Política de Privacidade
          </button>
        </div>

        <div className="legal-content">
          {abaAtiva === 'termos' ? (
            <div>
              <h2>1. Aceitação dos Termos</h2>
              <p>Ao acessar e utilizar a plataforma <strong>Quero1Horario</strong>, você concorda com estes Termos de Uso. Se você não concordar, por favor, não utilize nossos serviços.</p>
              
              <h2>2. Descrição do Serviço</h2>
              <p>O Quero1Horario é um software de gestão e agendamento online (SaaS) destinado a barbearias e salões de beleza. O sistema permite o gerenciamento de agenda, equipe, serviços e faturamento.</p>

              <h2>3. Planos e Pagamentos</h2>
              <p>Os planos são cobrados de forma mensal. O pagamento é processado de forma segura pelo <strong>Mercado Pago</strong>. O acesso ao painel será liberado somente após a confirmação do pagamento. Em caso de não renovação, o acesso será suspenso.</p>

              <h2>4. Responsabilidades do Usuário</h2>
              <p>O dono da barbearia é o único responsável pelas informações inseridas no sistema, incluindo dados de clientes, preços e horários. É proibido usar a plataforma para fins ilícitos.</p>

              <h2>5. Cancelamento</h2>
              <p>O usuário pode cancelar sua assinatura a qualquer momento entrando em contato com o suporte. Não há multa de cancelamento, mas não haverá reembolso de meses já pagos.</p>
            </div>
          ) : (
            <div>
              <h2>1. Coleta de Dados (LGPD)</h2>
              <p>Em conformidade com a Lei Geral de Proteção de Dados (LGPD), informamos que coletamos dados essenciais para o funcionamento do serviço: nome, e-mail, telefone e histórico de agendamentos.</p>

              <h2>2. Uso dos Dados</h2>
              <p>Os dados dos clientes finais (que agendam na sua barbearia) são utilizados exclusivamente para a gestão da sua agenda e envio de lembretes via WhatsApp. Nós <strong>não vendemos</strong> dados para terceiros.</p>

              <h2>3. Segurança</h2>
              <p>Utilizamos a infraestrutura do Google Firebase, que possui criptografia de ponta a ponta e protocolos rigorosos de segurança para proteger as informações armazenadas.</p>

              <h2>4. Seus Direitos</h2>
              <p>Você pode solicitar a exclusão ou correção dos seus dados a qualquer momento através do e-mail de suporte.</p>

              <h2>5. Cookies</h2>
              <p>Utilizamos cookies apenas para manter a sua sessão ativa no sistema (login).</p>
            </div>
          )}
        </div>

        <footer className="legal-footer">
          <p>Última atualização: {new Date().toLocaleDateString('pt-BR')}</p>
        </footer>

      </div>
    </div>
  );
}