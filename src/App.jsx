import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import CadastroAluno from './pages/CadastroAluno';
import Dashboard from './pages/Dashboard';
import ListaAlunos from './pages/ListaAlunos';
import VisualizarAluno from './pages/VisualizarAluno';
import EditarAluno from './pages/EditarAluno';
import HistoricoEvolucao from './pages/HistoricoEvolucao';
import NovaEvolucao from './pages/NovaEvolucao';
import NovoPagamento from './pages/NovoPagamento';
import ListaPagamentos from './pages/ListaPagamentos';




function App() {
  const [logado, setLogado] = useState(!!localStorage.getItem('token'));

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login onLogin={() => setLogado(true)} />} />
        <Route path="/dashboard" element={logado ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="/" element={logado ? <Login/> : <Navigate to="/login" />} />
        <Route path="/cadastro" element={logado ? <CadastroAluno /> : <Navigate to="/login" />} />
        <Route path="/alunos" element={logado ? <ListaAlunos /> : <Navigate to="/login" />} />
        <Route path="/alunos/:id" element={<VisualizarAluno />} />
        <Route path="/alunos/:id/editar" element={<EditarAluno />} />
        <Route path="/alunos/:id/evolucao" element={<HistoricoEvolucao />} />
        <Route path="/alunos/:id/adicionarEvolucao" element={<NovaEvolucao />} />
        <Route path="/pagamentos" element={logado ? <NovoPagamento /> : <Navigate to="/login" />} />
        <Route path="/listapagamentos" element={logado ? <ListaPagamentos /> : <Navigate to="/login" />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;