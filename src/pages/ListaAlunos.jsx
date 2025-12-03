import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Box,
  CircularProgress, // Para loading
  Chip, // Para o status Ativo/Inativo
  IconButton, // Para botões de ação na tabela
} from '@mui/material';

// Ícones
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import HistoryIcon from '@mui/icons-material/History';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// --- Estilos do Tema de Academia (Reutilizados) ---
const themeStyles = {
    primaryColor: '#ffc107', 
    darkBackground: '#1c1c1c',
    mediumBackground: '#292929',
    lightText: '#f0f0f0',
};

function ListaAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAlunos = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }

        const res = await api.get('/alunos', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Ordena por nome antes de exibir
        const sortedAlunos = res.data.sort((a, b) => a.nome.localeCompare(b.nome));
        setAlunos(sortedAlunos);
      } catch (err) {
        console.error('Erro ao buscar alunos:', err);
        // Opcional: Tratar erro de autenticação
        if (err.response && err.response.status === 401) {
             navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAlunos();
  }, [navigate]);

  const visualizarAluno = (id) => {
    navigate(`/alunos/${id}`);
  };

  const editarAluno = (id) => {
    navigate(`/alunos/${id}/editar`);
  };

  const excluirAluno = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este aluno? Esta ação é irreversível.')) {
      try {
        const token = localStorage.getItem('token');
        await api.delete(`/alunos/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Remove o aluno da lista local
        setAlunos(alunos.filter(a => a.id !== id));
      } catch (err) {
        console.error('Erro ao excluir aluno:', err);
        alert('Falha ao excluir o aluno. Tente novamente.');
      }
    }
  };


  return (
    // Container principal com o fundo escuro do tema
    <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, p: { xs: 2, md: 4 } }}>
      <Container maxWidth="lg">
        
        {/* Título */}
        <Typography 
          variant="h4" 
          gutterBottom 
          sx={{ 
            color: themeStyles.primaryColor, 
            fontWeight: 'bold', 
            mb: 4, 
            borderBottom: `3px solid ${themeStyles.primaryColor}`, 
            pb: 1 
          }}
        >
          📋 Gerenciamento de Alunos
        </Typography>

        {/* Botões de Ação Rápida */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
            <Button
                variant="contained"
                onClick={() => navigate('/cadastro')}
                startIcon={<PersonAddIcon />}
                sx={{ 
                    backgroundColor: themeStyles.primaryColor, 
                    color: themeStyles.darkBackground, 
                    '&:hover': { backgroundColor: '#e0a800' },
                    fontWeight: 'bold'
                }}
            >
                Cadastrar Novo Aluno
            </Button>
            <Button
                variant="outlined"
                onClick={() => navigate('/dashboard')}
                startIcon={<ArrowBackIcon />}
                sx={{ 
                    borderColor: themeStyles.primaryColor, 
                    color: themeStyles.primaryColor, 
                    '&:hover': { backgroundColor: `${themeStyles.primaryColor}20` }
                }}
            >
                Voltar ao Dashboard
            </Button>
        </Box>

        {/* Indicador de Loading */}
        {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress sx={{ color: themeStyles.primaryColor }} />
                <Typography sx={{ ml: 2, color: themeStyles.lightText }}>Carregando alunos...</Typography>
            </Box>
        )}

        {/* Tabela de Alunos */}
        {!loading && (
            <Paper 
                elevation={6} 
                sx={{ 
                    backgroundColor: themeStyles.mediumBackground, 
                    borderRadius: 2, 
                    overflow: 'hidden' 
                }}
            >
                <TableContainer>
                    <Table sx={{ minWidth: 650 }} aria-label="lista de alunos">
                        
                        {/* Cabeçalho da Tabela */}
                        <TableHead>
                            <TableRow sx={{ backgroundColor: themeStyles.darkBackground }}>
                                <TableCell sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', fontSize: '1rem' }}>Nome</TableCell>
                                <TableCell sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', fontSize: '1rem' }}>Telefone</TableCell>
                                <TableCell sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', fontSize: '1rem' }}>Status</TableCell>
                                <TableCell align="right" sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', fontSize: '1rem' }}>Ações</TableCell>
                            </TableRow>
                        </TableHead>

                        {/* Corpo da Tabela */}
                        <TableBody>
                            {alunos.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ color: themeStyles.lightText, py: 3 }}>
                                        Nenhum aluno cadastrado.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                alunos.map((aluno) => (
                                    <TableRow
                                        key={aluno.id}
                                        sx={{ 
                                            '&:nth-of-type(odd)': { backgroundColor: '#2f2f2f' }, // Zebrado para leitura
                                            '&:hover': { backgroundColor: '#383838' } // Efeito hover na linha
                                        }}
                                    >
                                        <TableCell component="th" scope="row" sx={{ color: themeStyles.lightText }}>
                                            {aluno.nome}
                                        </TableCell>
                                        <TableCell sx={{ color: themeStyles.lightText }}>{aluno.telefone}</TableCell>
                                        <TableCell>
                                            <Chip
                                                label={aluno.ativo ? 'Ativo' : 'Inativo'}
                                                size="small"
                                                // Cores do Chip customizadas
                                                sx={{ 
                                                    backgroundColor: aluno.ativo ? '#1e8449' : '#943126', 
                                                    color: '#fff',
                                                    fontWeight: 'bold'
                                                }}
                                            />
                                        </TableCell>
                                        
                                        {/* Coluna de Ações com IconButtons */}
                                        <TableCell align="right">
                                            <IconButton color="primary" onClick={() => visualizarAluno(aluno.id)} title="Visualizar Detalhes">
                                                <VisibilityIcon />
                                            </IconButton>
                                            <IconButton sx={{ color: '#ffc107' }} onClick={() => editarAluno(aluno.id)} title="Editar Ficha">
                                                <EditIcon />
                                            </IconButton>
                                            <IconButton sx={{ color: '#f44336' }} onClick={() => excluirAluno(aluno.id)} title="Excluir Aluno">
                                                <DeleteIcon />
                                            </IconButton>
                                            <IconButton color="info" onClick={() => navigate(`/alunos/${aluno.id}/evolucao`)} title="Histórico de Evolução">
                                                <HistoryIcon />
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>
        )}

      </Container>
    </Box>
  );
}

export default ListaAlunos;