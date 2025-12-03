import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Box,
    CircularProgress,
    Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

// --- Estilos do Tema de Academia (Reutilizados) ---
const themeStyles = {
    primaryColor: '#ffc107',
    darkBackground: '#1c1c1c',
    mediumBackground: '#292929',
    lightText: '#f0f0f0',
};

// Mapeamento de campos para labels legíveis
const camposMedidas = [
    'peso', 'altura', 'bracoEsquerdo', 'bracoDireito', 'cochaEsquerda', 'cochaDireita',
    'abdomen', 'panturrilhaEsquerda', 'panturrilhaDireita', 'cintura', 'quadril', 'busto',
    'gorduraCorporal', 'gorduraVisceral', 'musculatura', 'indiceMassa', 'idadeCorporal', 'kcal'
];

// Função simples para formatar telefone (máscara básica brasileira)
const formatPhone = (value) => {
    // Remove tudo que não for dígito
    value = value.replace(/\D/g, '');
    if (value.length > 0) value = value.replace(/^(\d{2})/, '($1) ');
    if (value.length > 5) value = value.replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    return value;
};


function EditarAluno() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [dados, setDados] = useState(null);
    const [mensagem, setMensagem] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAluno = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await api.get(`/alunos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setDados(res.data);
            } catch (err) {
                console.error('Erro ao buscar aluno:', err);
                setMensagem({ type: 'error', text: 'Aluno não encontrado ou erro de conexão.' });
            } finally {
                setLoading(false);
            }
        };

        fetchAluno();
    }, [id, navigate]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        let newValue = value;
        if (name === 'telefone') {
             // Aplica a formatação no valor
             newValue = formatPhone(value);
        }

        setDados({ ...dados, [name]: type === 'checkbox' ? checked : newValue });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensagem(null);
        
        try {
            const token = localStorage.getItem('token');
            const dadosConvertidos = {
                ...dados,
                ...camposMedidas.reduce((acc, campo) => {
                    const rawValue = dados[campo];
                    acc[campo] = ['idadeCorporal', 'kcal'].includes(campo) 
                        ? parseInt(rawValue) || 0 
                        : parseFloat(rawValue) || 0;
                    return acc;
                }, {})
            };

            await api.put(`/alunos/${id}`, dadosConvertidos, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMensagem({ type: 'success', text: '✅ Dados atualizados com sucesso!' });
            setTimeout(() => navigate('/alunos'), 1500);
        } catch (err) {
            console.error('Erro na atualização:', err);
            setMensagem({ type: 'error', text: '❌ Erro ao atualizar aluno. Verifique os dados.' });
        }
    };

    const renderTextField = (name, label, type = 'text', step = '0.01', xs = 12, sm = 4) => {
        const inputType = ['peso', 'altura', 'idadeCorporal', 'kcal'].includes(name) ? 'number' : type;
        const isRequired = name === 'nome' || name === 'telefone';

        return (
            <Grid item xs={xs} sm={sm} key={name}>
                <TextField
                    fullWidth
                    label={label}
                    name={name}
                    type={inputType}
                    value={dados[name] || ''}
                    onChange={handleChange}
                    required={isRequired}
                    inputProps={{ step: inputType === 'number' ? step : undefined }}
                    sx={{
                        mt: 2,
                        '& .MuiInputLabel-root': { color: themeStyles.lightText + 'A0' },
                        '& .MuiOutlinedInput-root': {
                            backgroundColor: themeStyles.darkBackground,
                            color: themeStyles.lightText,
                            '& fieldset': { borderColor: themeStyles.mediumBackground },
                            '&:hover fieldset': { borderColor: themeStyles.primaryColor },
                            '&.Mui-focused fieldset': { borderColor: themeStyles.primaryColor, borderWidth: '2px' },
                        },
                    }}
                />
            </Grid>
        );
    };

    if (loading || !dados) return (
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress sx={{ color: themeStyles.primaryColor }} />
        </Box>
    );

    const getLabel = (campo) => {
        return campo.replace(/([A-Z])/g, ' $1').replace('braco', 'Braço').replace('cocha', 'Coxa').replace('panturrilha', 'Panturrilha').replace('gordura', 'Gordura').replace('indice', 'Índice').replace('massa', 'Massa').replace('kcal', 'Kcal')
            .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    };

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, p: { xs: 2, md: 4 } }}>
            <Container maxWidth="lg">
                <Paper
                    elevation={10}
                    sx={{
                        p: { xs: 3, sm: 5 },
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
                        ⚙️ Editar Ficha: {dados.nome}
                    </Typography>

                    {mensagem && <Alert severity={mensagem.type} sx={{ mb: 3 }}>{mensagem.text}</Alert>}

                    <form onSubmit={handleSubmit}>

                        <Box sx={{ mb: 4, borderLeft: `5px solid ${themeStyles.primaryColor}`, pl: 2 }}>
                             <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: themeStyles.lightText }}>
                                Dados Pessoais
                            </Typography>
                            <Grid container spacing={3}>
                                {renderTextField('nome', 'Nome Completo', 'text', '0', 12, 6)}
                                {renderTextField('telefone', 'Telefone', 'tel', '0', 12, 6)}

                                <Grid item xs={12} sm={6}>
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={dados.ativo}
                                                onChange={handleChange}
                                                name="ativo"
                                                sx={{ color: themeStyles.primaryColor }}
                                            />
                                        }
                                        label="Aluno Ativo na Academia"
                                        sx={{ color: themeStyles.lightText, mt: 2 }}
                                    />
                                </Grid>
                            </Grid>
                        </Box>

                        <Divider sx={{ my: 4, bgcolor: themeStyles.lightText + '40' }} />

                        <Box sx={{ mb: 4, borderLeft: `5px solid ${themeStyles.primaryColor}`, pl: 2 }}>
                            <Typography variant="h5" sx={{ display: 'flex', alignItems: 'center', mb: 2, color: themeStyles.lightText }}>
                                Avaliação Antropométrica e Corporal
                            </Typography>
                            <Grid container spacing={3}>
                                {camposMedidas.map((campo) => (
                                    renderTextField(campo, getLabel(campo), 'number', campo === 'idadeCorporal' || campo === 'kcal' ? '1' : '0.01')
                                ))}
                            </Grid>
                        </Box>


                        <Button
                            type="submit"
                            variant="contained"
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
                            startIcon={<SaveIcon />}
                        >
                            Salvar Alterações
                        </Button>
                    </form>
                </Paper>
            </Container>
        </Box>
    );
}

export default EditarAluno;