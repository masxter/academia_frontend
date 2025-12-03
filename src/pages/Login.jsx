import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// --- Estilos CSS embutidos para esta demonstração ---
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1c1c1c', // Fundo escuro
    color: '#f0f0f0',           // Texto claro
    fontFamily: 'Arial, sans-serif',
  },
  loginBox: {
    width: '100%',
    maxWidth: '400px',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.5)',
    backgroundColor: '#292929', // Cor da caixa de login
  },
  heading: {
    textAlign: 'center',
    marginBottom: '30px',
    color: '#ffc107', // Destaque Amarelo/Dourado (cor de academia)
    fontSize: '2rem',
    fontWeight: 'bold',
  },
  input: {
    display: 'block',
    width: 'calc(100% - 20px)', // Ajuste para padding
    padding: '10px',
    marginBottom: '20px',
    borderRadius: '5px',
    border: '1px solid #444',
    backgroundColor: '#333',
    color: '#f0f0f0',
    fontSize: '1rem',
  },
  button: {
    width: '100%',
    padding: '12px',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#ffc107', // Cor de destaque
    color: '#1c1c1c',           // Texto escuro no botão
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#e0a800', // Um pouco mais escuro no hover
  },
  error: {
    color: '#ff4444',
    textAlign: 'center',
    marginBottom: '15px',
    fontWeight: 'bold',
  }
};
// --- Fim dos Estilos ---

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [isHovering, setIsHovering] = useState(false); // Estado para o efeito hover do botão

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');
    //console.log('Botão clicado');

    try {
      const res = await api.post('/auth/login', { email, senha });
      console.log('Resposta do backend:', res.data);

      localStorage.setItem('token', res.data.token);
      
      // Chamada opcional do onLogin (se a prop existir)
      if (onLogin) onLogin(); 
      
      navigate('/dashboard'); // redireciona após login
    } catch (err) {
      console.error('Erro ao logar:', err.response?.data?.erro || err.message);
      setErro(err.response?.data?.erro || 'Erro ao fazer login');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.loginBox}>
        <h2 style={styles.heading}>💪 Gerenciamento da Academia</h2>
        
        {erro && <p style={styles.error}>{erro}</p>}
        
        <form onSubmit={handleLogin}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            style={styles.input}
          />
          <input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={e => setSenha(e.target.value)}
            required
            style={styles.input}
          />
          <button 
            type="submit" 
            style={isHovering ? { ...styles.button, ...styles.buttonHover } : styles.button}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            Entrar
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;