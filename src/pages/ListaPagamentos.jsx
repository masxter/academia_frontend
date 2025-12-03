import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// Estilos baseados no seu Dashboard.js
const styles = {
  primaryColor: '#ffc107',
  darkBackground: '#1c1c1c',
  lightText: '#f0f0f0',
  container: {
    minHeight: '100vh',
    padding: '2rem',
    backgroundColor: '#1c1c1c',
    color: '#f0f0f0',
    fontFamily: 'Arial, sans-serif',
  },
  heading: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '2rem',
    paddingBottom: '0.5rem',
    borderBottom: '4px solid #ffc107',
    color: '#f0f0f0',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '1.5rem',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.4)',
  },
  th: {
    backgroundColor: '#333333',
    color: '#ffc107',
    padding: '12px 15px',
    textAlign: 'left',
    fontWeight: 'bold',
    borderBottom: '2px solid #ffc107',
  },
  td: {
    padding: '12px 15px',
    borderBottom: '1px solid #444444',
    color: '#f0f0f0',
  },
  tr: {
    transition: 'background-color 0.2s',
  },
  trHover: {
    backgroundColor: '#282828',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#ffc107',
  },
  error: {
    textAlign: 'center',
    fontSize: '1.2rem',
    color: '#FF6B6B',
  },
};

function ListaPagamentos() {
  const [pagamentos, setPagamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Função auxiliar para formatar a data
  const formatarData = (dataString) => {
    if (!dataString) return 'N/A';
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR'); 
  };

  // Função auxiliar para formatar valor monetário
  const formatarValor = (valor) => {
    if (valor === undefined || valor === null) return 'R$ 0,00';
    return `R$ ${parseFloat(valor).toFixed(2).replace('.', ',')}`;
  };

  useEffect(() => {
    const fetchPagamentos = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        const response = await api.get('alunos/listapagamentos', {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPagamentos(response.data); 

      } catch (err) {
        console.error('Erro ao buscar pagamentos:', err);
        setError('Não foi possível carregar a lista de pagamentos. Verifique a conexão e o token.');
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPagamentos();
  }, [navigate]);

  const renderTable = () => {
    if (loading) {
      return <div style={styles.loading}>Carregando pagamentos...</div>;
    }
    if (error) {
      return <div style={styles.error}>{error}</div>;
    }
    if (pagamentos.length === 0) {
      return <div style={{ ...styles.loading, color: styles.lightText }}>Nenhum pagamento encontrado.</div>;
    }
    
    return (
      <table style={styles.table}>
        <thead>
          <tr>
            {/* Título da coluna alterado para Nome do Aluno */}
            <th style={styles.th}>Nome do Aluno</th> 
            <th style={styles.th}>Valor</th>
            <th style={styles.th}>Data do Pagamento</th>
          </tr>
        </thead>
        <tbody>
          {pagamentos.map((p, index) => {
            // 💡 Pegando o nome do objeto aninhado (aluno ou usuário)
            // Assumimos que o objeto relacionado é 'usuario' ou 'aluno'
            const nomeAluno = p.usuario?.nome || p.aluno?.nome || 'Nome Indisponível';
            
            return (
                <tr 
                    key={p.id || index} 
                    style={styles.tr} 
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = styles.trHover.backgroundColor}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                    {/* Exibindo o Nome do Aluno */}
                    <td style={styles.td}>{nomeAluno}</td> 
                    <td style={styles.td}>{formatarValor(p.valor)}</td>
                    <td style={styles.td}>{formatarData(p.dataPagamento)}</td>
                </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>🧾 Lista de Pagamentos</h2>
      
      <button
        onClick={() => navigate('/dashboard')}
        style={{
          padding: '8px 15px', 
          backgroundColor: '#444', 
          color: styles.lightText,
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginBottom: '15px'
        }}
      >
        ← Voltar ao Dashboard
      </button>

      {renderTable()}
    </div>
  );
}

export default ListaPagamentos;