import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { Phone, Award, Cake, Lock, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import './Clientes.css';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [plano, setPlano] = useState('basico');

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      try {
        // Busca o plano da loja
        const lojaRef = doc(db, "barbearias", user.uid);
        const lojaSnap = await getDoc(lojaRef);
        if (lojaSnap.exists()) {
          setPlano(lojaSnap.data().plano || 'basico');
        }

        // Busca os agendamentos concluídos do profissional
        const q = query(
          collection(db, "agendamentos"), 
          where("barbeiroId", "==", user.uid),
          where("status", "==", "concluido")
        );
        const querySnapshot = await getDocs(q);
        
        const mapaClientes = {};
        querySnapshot.forEach((doc) => {
          const dados = doc.data();
          if (!mapaClientes[dados.clienteId]) {
            mapaClientes[dados.clienteId] = {
              id: dados.clienteId,
              nome: dados.clienteNome,
              telefone: dados.clienteTelefone,
              cortes: 0,
              totalGasto: 0,
              ultimaVisita: dados.data
            };
          }
          mapaClientes[dados.clienteId].cortes += 1;
          mapaClientes[dados.clienteId].totalGasto += dados.preco;
          
          // Atualiza a última visita se for mais recente
          if (dados.data > mapaClientes[dados.clienteId].ultimaVisita) {
            mapaClientes[dados.clienteId].ultimaVisita = dados.data;
          }
        });

        // Para cada cliente, busca a data de nascimento no Firestore
        const listaCompleta = [];
        for (const id in mapaClientes) {
          const clienteRef = doc(db, "clientes", id);
          const clienteSnap = await getDoc(clienteRef);
          let dataNascimento = '';
          if (clienteSnap.exists()) {
            dataNascimento = clienteSnap.data().dataNascimento || '';
          }
          listaCompleta.push({ ...mapaClientes[id], dataNascimento });
        }

        setClientes(listaCompleta);
      } catch (error) {
        console.error("Erro ao buscar clientes:", error);
      } finally {
        setCarregando(false);
      }
    });
    return () => unsubscribeAuth();
  }, []);

  function formatarAniversario(data) {
    if (!data) return 'Não informado';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}`;
  }

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase())
  );

  if (carregando) return <p style={{ padding: '40px', color: 'var(--muted)' }}>Carregando clientes...</p>;

  // TRAVA DE PLANO: Básico não tem acesso
  if (plano === 'basico') {
    return (
      <div style={{ textAlign: 'center', marginTop: '80px' }}>
        <Lock size={48} color="var(--primary)" style={{ margin: '0 auto 20px' }} />
        <h2 style={{ color: 'var(--cream)' }}>Recurso do Plano Pro</h2>
        <p style={{ color: 'var(--muted)', marginBottom: '30px' }}>
          A Gestão de Clientes está disponível nos planos Pro e Premium.
        </p>
        <Link to="/planos" className="btn-primary">Fazer Upgrade</Link>
      </div>
    );
  }

  return (
    <div className="clientes-container">
      <header className="clientes-header">
        <h1>Meus Clientes</h1>
        <p>Veja quem são seus clientes fiéis e quando é o aniversário deles.</p>
      </header>

      <input 
        type="text" 
        placeholder="Buscar cliente pelo nome..." 
        value={busca}
        onChange={e => setBusca(e.target.value)}
        className="busca-clientes"
      />

      {clientesFiltrados.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Nenhum cliente encontrado.</p>
      ) : (
        <div className="clientes-grid">
          {clientesFiltrados.map(cliente => (
            <div key={cliente.id} className="cliente-card card">
              <div className="cliente-header">
                <h3>{cliente.nome}</h3>
                {cliente.telefone && (
                  <a href={`https://wa.me/55${cliente.telefone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer">
                    <Phone size={16} /> {cliente.telefone}
                  </a>
                )}
              </div>
              
              <div className="cliente-stats">
                <div>
                  <Award size={16} color="var(--primary)" />
                  <strong>{cliente.cortes}</strong>
                  <span>cortes</span>
                </div>
                <div>
                  <strong>R$ {cliente.totalGasto}</strong>
                  <span>gastos</span>
                </div>
              </div>

              <div className="cliente-aniversario">
                <Cake size={16} color="var(--primary)" />
                <span>Aniversário: {formatarAniversario(cliente.dataNascimento)}</span>
              </div>

              {/* ÚLTIMA VISITA (SÓ PARA PREMIUM) */}
              {plano === 'premium' && cliente.ultimaVisita && (
                <div className="cliente-ultima-visita">
                  <Calendar size={16} color="var(--primary)" />
                  <span>Última visita: {cliente.ultimaVisita}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}