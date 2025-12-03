import React, { useEffect, useState } from 'react';
import ResumoCard from '../components/ResumoCard';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    headerContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        paddingBottom: '0.5rem',
        borderBottom: '4px solid #ffc107',
    },
    heading: {
        fontSize: '2.5rem',
        fontWeight: 'bold',
        color: '#f0f0f0',
        margin: 0, // Remover margem para alinhar com o flexbox
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
    },
    sectionTitle: {
        fontSize: '1.5rem',
        fontWeight: 'bold',
        color: '#ffc107',
        marginTop: '3rem',
        marginBottom: '1rem',
    },
    // Estilos padronizados para botões de ação
    buttonStyle: {
        padding: '12px 25px',
        backgroundColor: '#ffc107', // Usando o primaryColor diretamente
        color: '#1c1c1c', // Usando o darkBackground diretamente
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        fontSize: '1rem',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
        whiteSpace: 'nowrap', // Impede que o texto do botão quebre
    },
    // Estilo específico para o botão de Logout
    logoutButton: {
        padding: '8px 15px',
        backgroundColor: '#943126', // Vermelho para indicar ação de saída
        color: '#f0f0f0',
        border: 'none',
        borderRadius: '5px',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    }
};


function Dashboard() {
    const [resumo, setResumo] = useState({
        total: 0,
        ativos: 0,
        inativos: 0,
        ultimoAluno: '',
    });

    const [caixa, setCaixa] = useState({
        entradas: 0,
        saidas: 0,
        saldo: 0,
    });

    const navigate = useNavigate();

    // 💡 NOVA FUNÇÃO DE LOGOUT
    const handleLogout = () => {
        // 1. Excluir o token salvo
        localStorage.removeItem('token');
        console.log('Token removido. Usuário deslogado.');
        
        // 2. Redirecionar para a página de login
        navigate('/login');
    };

    useEffect(() => {
        const fetchResumo = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                // --- Alunos ---
                const resAlunos = await api.get('/alunos', {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const alunos = resAlunos.data;
                const ativos = alunos.filter((a) => a.ativo).length;
                const inativos = alunos.length - ativos;
                const ultimo = alunos[alunos.length - 1]?.nome || 'Nenhum'; 

                setResumo({
                    total: alunos.length,
                    ativos,
                    inativos,
                    ultimoAluno: ultimo,
                });

                // --- Fluxo de Caixa (Receitas) ---
                const hoje = new Date();
                const mes = hoje.getMonth() + 1;
                const ano = hoje.getFullYear();

                const resCaixa = await api.get(`alunos/resumo-receita?mes=${mes}&ano=${ano}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const entradas = resCaixa.data.totalRecebido || 0;
                const saidas = 0; 
                const saldo = entradas - saidas;

                setCaixa({ entradas, saidas, saldo });
            } catch (err) {
                console.error('Erro ao buscar dados:', err.response?.data?.erro || err.message);
                // Se receber 401 (Não Autorizado), também faz o logout
                if (err.response && err.response.status === 401) {
                    handleLogout(); // Usar a nova função para limpar o token e redirecionar
                }
            }
        };

        fetchResumo();
    }, [navigate]);

    // Função auxiliar para aplicar hover style (usando buttonStyle)
    const handleMouseOver = (e) => (e.currentTarget.style.backgroundColor = '#e0a800');
    const handleMouseOut = (e) => (e.currentTarget.style.backgroundColor = styles.primaryColor);
    
    // Função auxiliar para aplicar hover style no botão de Logout
    const handleLogoutMouseOver = (e) => (e.currentTarget.style.backgroundColor = '#c0392b');
    const handleLogoutMouseOut = (e) => (e.currentTarget.style.backgroundColor = '#943126');


    return (
        <div style={styles.container}>
            
            {/* 💡 Novo Header Container para alinhar título e botão de Logout */}
            <div style={styles.headerContainer}>
                <h2 style={styles.heading}>🏠 Dashboard Principal</h2>
                <button
                    onClick={handleLogout}
                    style={styles.logoutButton}
                    onMouseOver={handleLogoutMouseOver}
                    onMouseOut={handleLogoutMouseOut}
                >
                    🚪 Sair
                </button>
            </div>

            <div style={styles.cardGrid}>
                <ResumoCard
                    titulo="Total de Alunos"
                    valor={resumo.total}
                    cor="#1e8449"
                    icon="👥"
                    onClick={() => navigate('/alunos')}
                />

                <ResumoCard titulo="Ativos" valor={resumo.ativos} cor="#2a6099" icon="✅" />

                <ResumoCard titulo="Inativos" valor={resumo.inativos} cor="#943126" icon="🛑" />

                <ResumoCard
                    titulo="Último Cadastrado"
                    valor={resumo.ultimoAluno}
                    cor="#8e44ad"
                    icon="🆕"
                />

                {/* Cards de fluxo de caixa */}
                <ResumoCard
                    titulo={`Entradas (${new Date().toLocaleDateString('pt-BR', { month: 'short' })})`}
                    valor={`R$ ${caixa.entradas.toFixed(2)}`}
                    cor="#27ae60"
                    icon="💰"
                />

                <ResumoCard
                    titulo="Saídas (Mês Atual)"
                    valor={`R$ ${caixa.saidas.toFixed(2)}`}
                    cor="#c0392b"
                    icon="💸"
                />

                <ResumoCard
                    titulo="Saldo (Mês Atual)"
                    valor={`R$ ${caixa.saldo.toFixed(2)}`}
                    cor="#2980b9"
                    icon="📊"
                />
            </div>

            <h3 style={styles.sectionTitle}>Ações Rápidas</h3>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
                
                {/* Botão 1: Cadastrar Novo Aluno */}
                <button
                    onClick={() => navigate('/cadastro')}
                    style={styles.buttonStyle} // Usando a nova constante
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    ➕ Cadastrar Novo Aluno
                </button>

                {/* Botão 2: Novo Pagamento (mudado para Novo Pagamento formulário) */}
                <button
                    onClick={() => navigate('/pagamentos/novo')} // Assumindo '/pagamentos/novo' é o form
                    style={styles.buttonStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    ➕ Novo Pagamento
                </button>

                {/* Botão 3: Verificar Todos os Pagamentos (mudado para /listapagamentos) */}
                <button
                    onClick={() => navigate('/listapagamentos')} 
                    style={styles.buttonStyle}
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                >
                    🧾 Verificar Pagamentos
                </button>
            </div>
        </div>
    );
}

export default Dashboard;