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
import Equipe from './pages/Equipe.jsx'
import Assinaturas from './pages/Assinaturas.jsx'
import Financeiro from './pages/Financeiro.jsx'
import Clientes from './pages/Clientes.jsx' // <-- NOVO IMPORT
import Layout from './components/Layout.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/planos" element={<Planos />} /> 
        <Route path="/criar-loja" element={<CriarLoja />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/admin" element={<SuperAdmin />} />
        <Route path="/minha-conta" element={<MinhaConta />} />

        <Route element={<Layout />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/servicos" element={<Servicos />} />
          <Route path="/equipe" element={<Equipe />} />
          <Route path="/fidelidade" element={<Fidelidade />} />
          <Route path="/assinaturas" element={<Assinaturas />} />
          <Route path="/financeiro" element={<Financeiro />} />
          <Route path="/clientes" element={<Clientes />} /> {/* <-- NOVA ROTA */}
        </Route>

        <Route path="/:slug" element={<Loja />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)