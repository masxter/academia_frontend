import React, { useState, useEffect } from 'react';
import api from '../services/api';

// Estilos padronizados (mantidos para consistência)
const styles = {
    primaryColor: '#ffc107',
    darkBackground: '#1c1c1c',
    cardBackground: '#282828', 
    lightText: '#f0f0f0',
    placeholderColor: '#999',
    container: {
        minHeight: '100vh',
        padding: '2rem',
        backgroundColor: '#1c1c1c',
        color: '#f0f0f0',
        fontFamily: 'Arial, sans-serif',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    formCard: {
        backgroundColor: '#282828',
        padding: '2rem',
        borderRadius: '10px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: '500px', 
    },
    heading: {
        fontSize: '2rem',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        paddingBottom: '0.5rem',
        borderBottom: '3px solid #ffc107',
        color: '#f0f0f0',
        textAlign: 'center',
    },
    inputGroup: {
        marginBottom: '20px',
        display: 'flex',
        flexDirection: 'column',
    },
    label: {
        marginBottom: '8px',
        fontWeight: 'bold',
        color: '#ffc107',
        fontSize: '1rem',
    },
    inputField: {
        padding: '12px',
        borderRadius: '5px',
        border: '1px solid #444',
        backgroundColor: '#333',
        color: '#f0f0f0',
        fontSize: '1rem',
        '::placeholder': { color: '#999' },
    },
    button: {
        padding: '12px 25px',
        backgroundColor: '#ffc107',
        color: '#1c1c1c',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        marginTop: '10px',
        width: '100%',
    },
    message: {
        padding: '10px',
        borderRadius: '5px',
        marginTop: '15px',
        textAlign: 'center',
        fontWeight: 'bold',
    },
};

export default function NovoPagamento() {
  const [valor, setValor] = useState('');
  const [dataPagamento, setDataPagamento] = useState('');
  const [nomeAluno, setNomeAluno] = useState(''); // Novo estado para o nome digitado
  const [usuarios, setUsuarios] = useState([]); // Lista completa de usuários/alunos
  const [mensagem, setMensagem] = useState('');

  // Carrega lista de usuários/alunos
  useEffect(() => {
    const carregarUsuarios = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await api.get('/alunos', {
            headers: { Authorization: `Bearer ${token}` },
        });
        setUsuarios(res.data);
      } catch (err) {
        console.error('Erro ao carregar usuários:', err.response?.data || err.message);
      }
    };
    carregarUsuarios();
  }, []);

  const salvarPagamento = async () => {
    setMensagem('');
    
    // 1. Encontra o ID do aluno com base no nome digitado/selecionado
    const alunoSelecionado = usuarios.find(u => u.nome === nomeAluno.trim());

    if (!valor || !dataPagamento || !alunoSelecionado) {
        setMensagem('❌ Por favor, preencha todos os campos e selecione um aluno válido da lista.');
        return;
    }
    
    const alunoId = alunoSelecionado.id;

    try {
      const token = localStorage.getItem('token');
      await api.post('alunos/pagamentos', {
        valor: parseFloat(valor.replace(',', '.')),
        dataPagamento,
        usuarioId: parseInt(alunoId), // Usa o ID encontrado
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      setMensagem('✅ Pagamento registrado com sucesso!');
      setValor('');
      setDataPagamento('');
      setNomeAluno(''); // Limpa o campo do aluno
    } catch (err) {
      console.error('Erro ao salvar pagamento:', err.response?.data || err.message);
      setMensagem(`❌ Erro ao registrar pagamento: ${err.response?.data?.erro || 'Tente novamente.'}`);
    }
  };

  const handleMouseOver = (e) => (e.currentTarget.style.backgroundColor = '#e0a800');
  const handleMouseOut = (e) => (e.currentTarget.style.backgroundColor = styles.primaryColor);

  return (
    <div style={styles.container}>
      <div style={styles.formCard}>
        <h2 style={styles.heading}>💰 Registrar Novo Pagamento</h2>

        {/* Campo Valor */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Valor (R$):</label>
          <input
            style={styles.inputField}
            type="number"
            value={valor}
            onChange={(e) => setValor(e.target.value)} 
            placeholder="Ex: 150.00"
          />
        </div>

        {/* Campo Data */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Data do Pagamento:</label>
          <input
            style={styles.inputField}
            type="date"
            value={dataPagamento}
            onChange={(e) => setDataPagamento(e.target.value)}
          />
        </div>

        {/* 💡 CAMPO ALUNO COM AUTOPREENCHIMENTO (DATALIST) */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Aluno:</label>
          <input
            style={styles.inputField}
            type="text"
            list="lista-alunos" // Liga o input ao datalist abaixo
            value={nomeAluno}
            onChange={(e) => setNomeAluno(e.target.value)} // Atualiza o nome digitado
            placeholder="Comece a digitar o nome do aluno..."
          />
          
          {/* O DATALIST fornece a lista de opções para o autocompletar */}
          <datalist id="lista-alunos">
            {usuarios.map((u) => (
              // O 'value' da option é o que será preenchido no input (o nome do aluno)
              <option key={u.id} value={u.nome} />
            ))}
          </datalist>
        </div>

        {/* Botão Salvar */}
        <button 
            onClick={salvarPagamento} 
            style={styles.button}
            onMouseOver={handleMouseOver}
            onMouseOut={handleMouseOut}
        >
            Salvar Pagamento
        </button>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <p 
            style={{ 
              ...styles.message,
              backgroundColor: mensagem.startsWith('✅') ? '#27ae6040' : '#c0392b40',
              color: mensagem.startsWith('✅') ? '#27ae60' : '#c0392b',
            }}
          >
            {mensagem}
          </p>
        )}
      </div>
    </div>
  );
}