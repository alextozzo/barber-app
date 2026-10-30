import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Servicos from './pages/Servicos.jsx'
import Layout from './components/Layout.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* Rota pública para os clientes */}
        <Route path="/" element={<Home />} />

        {/* Rotas do painel do barbeiro, envelopadas pelo Layout */}
        <Route element={<Layout />}>
          <Route path="/painel" element={<Dashboard />} />
          <Route path="/servicos" element={<Servicos />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)