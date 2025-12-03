import React, { useState } from 'react';
import api from '../services/api';
import {
  Container,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Grid,
  Paper,
  Alert,
  Box, // Importamos Box para criar separadores visuais
} from '@mui/material';
import { PersonAddAlt1, FitnessCenter, MonitorWeight, Save } from '@mui/icons-material'; // Ícones para categorias

// Definições de Estilos do Tema de Academia
const themeStyles = {
    // Cor de destaque (Amarelo/Dourado)
    primaryColor: '#ffc107', 
    // Fundo principal (Escuro)
    darkBackground: '#1c1c1c',
    // Cor do card/Paper
    mediumBackground: '#292929',
    // Cor do texto
    lightText: '#f0f0f0',
};

function CadastroAluno() {
    const [dados, setDados] = useState({
        nome: '',
        telefone: '',
        peso: '',
        altura: '',
        bracoEsquerdo: '',
        bracoDireito: '',
        cochaEsquerda: '',
        cochaDireita: '',
        abdomen: '',
        panturrilhaEsquerda: '',
        panturrilhaDireita: '',
        cintura: '',
        quadril: '',
        busto: '',
        gorduraCorporal: '',
        gorduraVisceral: '',
        musculatura: '',
        indiceMassa: '',
        idadeCorporal: '',
        kcal: '',
        ativo: true
    });

    const [mensagem, setMensagem] = useState('');

    const handleChange = (e) => {
        const { name, value, checked, type } = e.target;
        setDados({ 
            ...dados, 
            [name]: type === 'checkbox' ? checked : value 
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem('');

        const token = localStorage.getItem('token');

        // Lógica de conversão permanece a mesma
        const dadosConvertidos = {
            ...dados,
            peso: parseFloat(dados.peso) || 0,
            altura: parseFloat(dados.altura) || 0,
            // ... (restante das conversões de float e int)
            bracoEsquerdo: parseFloat(dados.bracoEsquerdo) || 0,
            bracoDireito: parseFloat(dados.bracoDireito) || 0,
            cochaEsquerda: parseFloat(dados.cochaEsquerda) || 0,
            cochaDireita: parseFloat(dados.cochaDireita) || 0,
            abdomen: parseFloat(dados.abdomen) || 0,
            panturrilhaEsquerda: parseFloat(dados.panturrilhaEsquerda) || 0,
            panturrilhaDireita: parseFloat(dados.panturrilhaDireita) || 0,
            cintura: parseFloat(dados.cintura) || 0,
            quadril: parseFloat(dados.quadril) || 0,
            busto: parseFloat(dados.busto) || 0,
            gorduraCorporal: parseFloat(dados.gorduraCorporal) || 0,
            gorduraVisceral: parseFloat(dados.gorduraVisceral) || 0,
            musculatura: parseFloat(dados.musculatura) || 0,
            indiceMassa: parseFloat(dados.indiceMassa) || 0,
            idadeCorporal: parseInt(dados.idadeCorporal) || 0,
            kcal: parseInt(dados.kcal) || 0,
        };

        try {
            await api.post('/alunos', dadosConvertidos, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMensagem('success'); // Define a severidade para a cor da mensagem
            // Limpa o formulário após o sucesso
            setDados({
                nome: '', telefone: '', peso: '', altura: '',
                bracoEsquerdo: '', bracoDireito: '', cochaEsquerda: '', cochaDireita: '',
                abdomen: '', panturrilhaEsquerda: '', panturrilhaDireita: '',
                cintura: '', quadril: '', busto: '', gorduraCorporal: '',
                gorduraVisceral: '', musculatura: '', indiceMassa: '',
                idadeCorporal: '', kcal: '', ativo: true
            });
        } catch (err) {
            console.error(err);
            setMensagem('error'); // Define a severidade para a cor de erro
        }
    };
    
    // Agrupamento dos campos para melhor organização visual
    const camposAgrupados = [
        { 
            titulo: 'Dados Pessoais e Status', 
            icon: <PersonAddAlt1 sx={{ mr: 1, color: themeStyles.primaryColor }} />,
            campos: ['nome', 'telefone', 'ativo'] 
        },
        { 
            titulo: 'Antropometria (Medidas)', 
            icon: <FitnessCenter sx={{ mr: 1, color: themeStyles.primaryColor }} />,
            campos: [
                'peso', 'altura', 'bracoEsquerdo', 'bracoDireito', 
                'cochaEsquerda', 'cochaDireita', 'abdomen', 
                'panturrilhaEsquerda', 'panturrilhaDireita', 'cintura', 
                'quadril', 'busto'
            ] 
        },
        { 
            titulo: 'Bioimpedância e Metabolismo', 
            icon: <MonitorWeight sx={{ mr: 1, color: themeStyles.primaryColor }} />,
            campos: [
                'gorduraCorporal', 'gorduraVisceral', 'musculatura', 
                'indiceMassa', 'idadeCorporal', 'kcal'
            ] 
        }
    ];

    // Função para renderizar o TextField com o tema dark
    const renderTextField = (name, label, type = 'text') => {
        // Define o tipo de input baseado no campo
        const inputType = ['peso', 'altura', 'idadeCorporal', 'kcal'].includes(name) ? 'number' : type;

        return (
            <TextField
                fullWidth
                label={label}
                name={name}
                type={inputType}
                value={dados[name]}
                onChange={handleChange}
                required={name === 'nome' || name === 'telefone'} // Apenas nome e telefone são obrigatórios
                // Estilos para tema escuro
                sx={{
                    '& .MuiInputLabel-root': { color: themeStyles.lightText + 'A0' }, // Label cinza claro
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: themeStyles.darkBackground, // Fundo do input escuro
                        color: themeStyles.lightText, // Texto do input claro
                        '& fieldset': { borderColor: themeStyles.mediumBackground }, // Borda normal
                        '&:hover fieldset': { borderColor: themeStyles.primaryColor }, // Borda hover
                        '&.Mui-focused fieldset': { borderColor: themeStyles.primaryColor, borderWidth: '2px' }, // Borda foco
                    },
                    mt: 2
                }}
            />
        );
    };

    return (
        // Container principal com fundo escuro
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, p: 4 }}>
            <Container maxWidth="lg">
                <Paper 
                    elevation={10} 
                    sx={{ 
                        p: { xs: 2, sm: 4 }, 
                        backgroundColor: themeStyles.mediumBackground, 
                        color: themeStyles.lightText, 
                        borderRadius: 3 
                    }}
                >
                    <Typography 
                        variant="h4" 
                        align="center" 
                        gutterBottom
                        sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', mb: 4 }}
                    >
                        📝 Novo Aluno - Ficha de Avaliação
                    </Typography>
                    
                    {/* Mensagens de feedback */}
                    {mensagem === 'success' && <Alert severity="success" sx={{ mb: 3 }}>✅ Aluno cadastrado com sucesso!</Alert>}
                    {mensagem === 'error' && <Alert severity="error" sx={{ mb: 3 }}>❌ Erro ao cadastrar aluno. Verifique os dados e a conexão.</Alert>}

                    <form onSubmit={handleSubmit}>
                        
                        {camposAgrupados.map((grupo, index) => (
                            <Box key={index} sx={{ mb: 4, borderLeft: `5px solid ${themeStyles.primaryColor}`, pl: 2 }}>
                                {/* Título do Grupo */}
                                <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: themeStyles.lightText }}>
                                    {grupo.icon}
                                    {grupo.titulo}
                                </Typography>

                                <Grid container spacing={3}>
                                    {grupo.campos.map((campo) => {
                                        if (campo === 'ativo') {
                                            // Renderização especial para o Checkbox
                                            return (
                                                <Grid item xs={12} sm={6} key={campo}>
                                                    <FormControlLabel
                                                        control={
                                                            <Checkbox
                                                                checked={dados.ativo}
                                                                onChange={handleChange}
                                                                name="ativo"
                                                                sx={{ color: themeStyles.primaryColor }}
                                                            />
                                                        }
                                                        label="Ativo na Academia"
                                                        sx={{ color: themeStyles.lightText, mt: 2 }}
                                                    />
                                                </Grid>
                                            );
                                        }
                                        
                                        // Renderização padrão para os TextFields
                                        // Converte camelCase para um Label mais legível
                                        const label = campo.replace(/([A-Z])/g, ' $1').replace('braco', 'Braço').replace('cocha', 'Coxa').replace('panturrilha', 'Panturrilha').replace('gordura', 'Gordura').replace('indice', 'Índice').replace('massa', 'Massa').replace('kcal', 'Kcal');
                                        
                                        // Ajusta o tamanho da coluna baseado no grupo
                                        const colSize = grupo.titulo === 'Dados Pessoais e Status' ? 6 : 4;

                                        return (
                                            <Grid item xs={12} sm={colSize} key={campo}>
                                                {renderTextField(campo, label.charAt(0).toUpperCase() + label.slice(1))}
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Box>
                        ))}

                        <Button
                            type="submit"
                            variant="contained"
                            // Estilo customizado para o botão de destaque
                            sx={{ 
                                mt: 4, 
                                backgroundColor: themeStyles.primaryColor, 
                                color: themeStyles.darkBackground, 
                                '&:hover': { backgroundColor: '#e0a800' }, 
                                fontSize: '1.1rem', 
                                py: 1.5,
                                fontWeight: 'bold'
                            }}
                            fullWidth
                            startIcon={<Save />}
                        >
                            Salvar Cadastro do Aluno
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

export default CadastroAluno;