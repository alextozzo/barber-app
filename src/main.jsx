import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Servicos from './pages/Servicos.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import CriarLoja from './pages/CriarLoja.jsx'
import Loja from './pages/Loja.jsx' 
import Planos from './pages/Planos.jsx'
import Fidelidade from './pages/Fidelidade.jsx'
import Checkout from './pages/Checkout.jsx'
import MinhaConta from './pages/MinhaConta.jsx'
import Equipe from './pages/Equipe.jsx' // <-- IMPORT DA EQUIPE AQUI
import Layout from './components/Layout.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota pública principal */}
        <Route path="/" element={<Home />} />

        {/* Página de Planos */}
        <Route path="/planos" element={<Planos />} /> 

        {/* Rota para o barbeiro criar/editar a loja */}
        <Route path="/criar-loja" element={<CriarLoja />} />

        {/* Tela de Pagamento (Checkout) */}
        <Route path="/checkout" element={<Checkout />} />

        {/* Rota do Super Admin */}
        <Route path="/admin" element={<SuperAdmin />} />

        {/* Área do Cliente (Histórico e Fidelidade) */}
        <Route path="/minha-conta" element={<MinhaConta />} />

        {/* Rotas do painel do barbeiro (protegidas pelo Layout) */}
        <Route element={<Layout />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/equipe" element={<Equipe />} /> {/* <-- NOVA ROTA AQUI */}
          <Route path="/fidelidade" element={<Fidelidade />} />
        </Route>

        {/* ROTA DINÂMICA: O link único do barbeiro (ex: /rafael-andrade) */}
        <Route path="/:slug" element={<Loja />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)