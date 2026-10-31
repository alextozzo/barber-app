import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Servicos from './pages/Servicos.jsx'
import SuperAdmin from './pages/SuperAdmin.jsx'
import CriarLoja from './pages/CriarLoja.jsx'
import Loja from './pages/Loja.jsx' // <-- IMPORT DA PÁGINA DA LOJA
import Layout from './components/Layout.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota pública principal */}
        <Route path="/" element={<Home />} />

        {/* Rota para o barbeiro criar/editar a loja */}
        <Route path="/criar-loja" element={<CriarLoja />} />

        {/* Rota do Super Admin */}
        <Route path="/admin" element={<SuperAdmin />} />

        {/* Rotas do painel do barbeiro */}
        <Route element={<Layout />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/servicos" element={<Servicos />} />
        </Route>

        {/* ROTA DINÂMICA: O link único do barbeiro (ex: /rafael-andrade) */}
        <Route path="/:slug" element={<Loja />} /> 
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)