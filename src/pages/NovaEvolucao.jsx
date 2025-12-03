import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

// Material UI Imports
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Box,
  Alert,
  CircularProgress,
  Paper,
  Divider,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StraightenIcon from '@mui/icons-material/Straighten';

// Recharts Imports - Adicionando BarChart e Bar
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart, // Novo Import
  Bar,       // Novo Import
} from 'recharts';

// --- Estilos do Tema de Academia (Reutilizados para consistência) ---
const themeStyles = {
  primaryColor: '#ffc107', // Amarelo
  darkBackground: '#1c1c1c', // Fundo Principal
  mediumBackground: '#292929', // Fundo do Card
  lightText: '#f0f0f0', // Cor do Texto
  // Cores de Gráfico
  weightColor: '#2196f3', // Azul (Peso)
  fatColor: '#f44336',   // Vermelho (Gordura)
  muscleColor: '#4caf50', // Verde (Musculatura)
  barColor: '#8884d8',    // Cor genérica para as barras
};

// Mapeamento de campos (Mantido o mesmo)
const camposDetalhes = [
  // ... (definição dos grupos de campos omitida por brevidade)
  {
    titulo: 'Medidas Essenciais',
    icon: <StraightenIcon sx={{ mr: 1 }} />,
    medidas: [
      { campo: 'peso', label: 'Peso (kg)', placeholder: '0.0' },
      { campo: 'altura', label: 'Altura (m)', placeholder: '0.00' },
      { campo: 'cintura', label: 'Cintura (cm)', placeholder: '0.0' },
      { campo: 'quadril', label: 'Quadril (cm)', placeholder: '0.0' },
      { campo: 'busto', label: 'Busto (cm)', placeholder: '0.0' },
    ],
  },
  {
    titulo: 'Antropometria (Membros)',
    icon: <StraightenIcon sx={{ mr: 1 }} />,
    medidas: [
      { campo: 'bracoDireito', label: 'Braço Direito (cm)', placeholder: '0.0' },
      { campo: 'bracoEsquerdo', label: 'Braço Esquerdo (cm)', placeholder: '0.0' },
      { campo: 'cochaDireita', label: 'Coxa Direita (cm)', placeholder: '0.0' },
      { campo: 'cochaEsquerda', label: 'Coxa Esquerda (cm)', placeholder: '0.0' },
      { campo: 'abdomen', label: 'Abdômen (cm)', placeholder: '0.0' },
      { campo: 'panturrilhaDireita', label: 'Panturrilha Dir. (cm)', placeholder: '0.0' },
      { campo: 'panturrilhaEsquerda', label: 'Panturrilha Esq. (cm)', placeholder: '0.0' },
    ],
  },
  {
    titulo: 'Bioimpedância e Metabolismo',
    icon: <StraightenIcon sx={{ mr: 1 }} />,
    medidas: [
      { campo: 'gorduraCorporal', label: 'Gordura Corporal (%)', placeholder: '0.0' },
      { campo: 'gorduraVisceral', label: 'Gordura Visceral', placeholder: '0.0' },
      { campo: 'musculatura', label: 'Musculatura (%)', placeholder: '0.0' },
      { campo: 'indiceMassa', label: 'Índice de Massa', placeholder: '0.0' },
      { campo: 'idadeCorporal', label: 'Idade Corporal (anos)', placeholder: '0' },
      { campo: 'kcal', label: 'Kcal (basal/dia)', placeholder: '0' },
    ],
  },
];
const allFields = camposDetalhes.flatMap(grupo => grupo.medidas);

// Componente para Gráfico de TENDÊNCIA (Linha)
const EvolucaoLineChart = ({ data, dataKey, name, color }) => (
    <Box sx={{ height: 300, width: '100%' }}>
        <Typography variant="h6" sx={{ color: themeStyles.lightText, textAlign: 'center', mb: 1 }}>
            Tendência de {name}
        </Typography>
        <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.lightText + '30'} />
                <XAxis dataKey="data" stroke={themeStyles.lightText} padding={{ left: 20, right: 20 }} />
                <YAxis stroke={themeStyles.lightText} domain={['auto', 'auto']} />
                <Tooltip 
                    contentStyle={{ backgroundColor: themeStyles.mediumBackground, border: `1px solid ${themeStyles.primaryColor}` }}
                    labelStyle={{ color: themeStyles.primaryColor }}
                />
                <Legend />
                <Line 
                    type="monotone" 
                    dataKey={dataKey} 
                    name={name}
                    stroke={color} 
                    strokeWidth={3}
                    dot={{ fill: color, stroke: themeStyles.mediumBackground, strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8 }}
                />
            </LineChart>
        </ResponsiveContainer>
    </Box>
);

// Componente para Gráfico de COMPARAÇÃO (Barras)
// Compara a Penúltima (Anterior) vs. a Última (Atual) avaliação
const ComparisonBarChart = ({ historicoData, dataKey, name, color }) => {
    if (historicoData.length < 2) return null;

    const ultima = historicoData[historicoData.length - 1];
    const penultima = historicoData[historicoData.length - 2];

    const dataBarra = [
        { 
            name: `Anterior (${penultima.data})`, 
            value: penultima[dataKey], 
            fill: color + 'A0' // Cor mais clara para o anterior
        },
        { 
            name: `Atual (${ultima.data})`, 
            value: ultima[dataKey], 
            fill: color // Cor completa para o atual
        },
    ].filter(item => item.value !== undefined && item.value !== null); // Filtra dados N/A

    if (dataBarra.length < 2) return null;

    return (
        <Box sx={{ height: 300, width: '100%' }}>
            <Typography variant="h6" sx={{ color: themeStyles.lightText, textAlign: 'center', mb: 1 }}>
                Comparação de {name}
            </Typography>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dataBarra} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={themeStyles.lightText + '30'} />
                    <XAxis dataKey="name" stroke={themeStyles.lightText} />
                    <YAxis stroke={themeStyles.lightText} domain={['auto', 'auto']} />
                    <Tooltip 
                        contentStyle={{ backgroundColor: themeStyles.mediumBackground, border: `1px solid ${themeStyles.primaryColor}` }}
                        labelStyle={{ color: themeStyles.primaryColor }}
                        formatter={(value) => [`${value} ${dataKey.includes('peso') ? 'kg' : dataKey.includes('gorduraCorporal') || dataKey.includes('musculatura') ? '%' : ''}`]}
                    />
                    <Bar dataKey="value" name={name} fill={themeStyles.barColor} label={{ position: 'top', fill: themeStyles.lightText, fontWeight: 'bold' }}>
                        {dataBarra.map((entry, index) => (
                            <Bar key={`bar-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </Box>
    );
};


function NovaEvolucao() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState('');
  const [loading, setLoading] = useState(false);
  const [dados, setDados] = useState(
    Object.fromEntries(allFields.map(m => [m.campo, '']))
  );
  const [historicoEvolucao, setHistoricoEvolucao] = useState([]);

  // --- BUSCAR HISTÓRICO DE EVOLUÇÃO ---
  useEffect(() => {
    const fetchHistorico = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await api.get(`/alunos/${id}/evolucao`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const dadosFormatados = res.data.map(item => ({
                ...item,
                data: new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                peso: parseFloat(item.peso),
                gorduraCorporal: parseFloat(item.gorduraCorporal),
                musculatura: parseFloat(item.musculatura),
            })).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); 
            
            setHistoricoEvolucao(dadosFormatados);
        } catch (err) {
            console.error('Erro ao buscar histórico de evolução:', err);
        }
    };

    fetchHistorico();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const cleanedValue = value.replace(',', '.'); 
    setDados({ ...dados, [name]: cleanedValue });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMensagem('');

    try {
      const token = localStorage.getItem('token');
      
      const dadosConvertidos = Object.fromEntries(
        Object.entries(dados)
          .map(([k, v]) => [k, v ? parseFloat(v) : null])
          .filter(([k, v]) => v !== null && !isNaN(v))
      );

      await api.post(`/alunos/${id}/adicionarEvolucao`, dadosConvertidos, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setMensagem('Evolução registrada com sucesso! Redirecionando...');
      
      // Atualiza o histórico localmente com a nova avaliação
      const novaEvolucao = {
          ...dadosConvertidos,
          createdAt: new Date().toISOString(),
          data: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      };
      setHistoricoEvolucao(prev => [...prev, novaEvolucao]);

      setTimeout(() => navigate(`/alunos/${id}/evolucao`), 2500); 
    } catch (err) {
      const erroMsg = err.response?.data?.mensagem || 'Erro ao registrar evolução. Tente novamente.';
      setMensagem(erroMsg);
    } finally {
      setLoading(false);
    }
  };

  // Verifica se há dados suficientes para plotar o gráfico
  const podePlotarGrafico = historicoEvolucao.length > 0;
  const podePlotarComparacao = historicoEvolucao.length >= 2;

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
          {/* Cabeçalho e Formulário (Mantidos) */}
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
            <AddCircleOutlineIcon sx={{ mr: 2, fontSize: 40, color: themeStyles.primaryColor }} />
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ color: themeStyles.primaryColor, fontWeight: 'bold' }}
            >
              Registro de Nova Avaliação Física
            </Typography>
          </Box>
          <Divider sx={{ mb: 4, bgcolor: themeStyles.primaryColor }} />
          {mensagem && (
            <Box sx={{ mb: 3 }}>
              <Alert severity={mensagem.includes('sucesso') ? 'success' : 'error'} onClose={() => setMensagem('')}>
                {mensagem}
              </Alert>
            </Box>
          )}

          <Typography variant="h5" gutterBottom sx={{ color: themeStyles.lightText, mb: 3 }}>
            Dados da Nova Avaliação
          </Typography>
          {/* ... Estrutura do formulário (mantida) ... */}
          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Grid container spacing={4}>
              {camposDetalhes.map((grupo, index) => (
                <Grid item xs={12} md={6} lg={4} key={index}>
                  <Box sx={{ mb: 2, borderBottom: `2px solid ${themeStyles.primaryColor}`, pb: 1 }}>
                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: themeStyles.lightText, fontWeight: 'bold' }}>
                      {grupo.icon}
                      {grupo.titulo}
                    </Typography>
                  </Box>

                  <Grid container spacing={2}>
                    {grupo.medidas.map((item) => (
                      <Grid item xs={12} key={item.campo}>
                        <TextField
                          fullWidth
                          label={item.label}
                          type="text" 
                          placeholder={item.placeholder}
                          variant="outlined"
                          name={item.campo}
                          value={dados[item.campo]}
                          onChange={handleChange}
                          size="small"
                          sx={{ 
                            '& .MuiInputBase-root': { color: themeStyles.lightText, backgroundColor: themeStyles.darkBackground },
                            '& .MuiOutlinedInput-notchedOutline': { borderColor: themeStyles.lightText + '50' },
                            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: themeStyles.primaryColor },
                            '& .MuiInputLabel-root': { color: themeStyles.lightText + '80' },
                            '& .MuiInputLabel-root.Mui-focused': { color: themeStyles.primaryColor },
                          }}
                          inputProps={{
                            inputMode: 'decimal',
                            pattern: '[0-9]*[.,]?[0-9]*'
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 5, display: 'flex', justifyContent: 'flex-start' }}>
              <Button
                type="submit"
                variant="contained"
                color="success"
                size="large"
                startIcon={loading ? <CircularProgress color="inherit" size={20} /> : <SaveIcon />}
                disabled={loading}
                sx={{
                  backgroundColor: themeStyles.primaryColor,
                  color: themeStyles.darkBackground,
                  fontWeight: 'bold',
                  '&:hover': { backgroundColor: '#e0a800' },
                }}
              >
                {loading ? 'Registrando...' : 'Salvar Avaliação'}
              </Button>
            </Box>
          </Box>
          {/* Fim do Formulário */}

          {/* --- GRÁFICOS DE EVOLUÇÃO --- */}
          <Box sx={{ mt: 8 }}>
            <Typography variant="h5" sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', mb: 4, borderBottom: `2px solid ${themeStyles.primaryColor}`, pb: 1 }}>
                Visualização da Evolução Histórica
            </Typography>

            {!podePlotarGrafico ? (
                <Typography sx={{ color: themeStyles.lightText + '80', textAlign: 'center', py: 5 }}>
                    Não há dados de avaliação anteriores para plotar os gráficos. Registre a primeira avaliação acima.
                </Typography>
            ) : (
                <Grid container spacing={4}>
                    
                    {/* Linha 1: Gráficos de Tendência (Linha) */}
                    <Grid item xs={12}>
                        <Typography variant="h6" sx={{ color: themeStyles.lightText, mb: 2 }}>Tendência ao longo do tempo (Todas as avaliações)</Typography>
                    </Grid>
                    
                    {/* Gráfico de Linha: Peso */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, backgroundColor: themeStyles.darkBackground }}>
                            <EvolucaoLineChart data={historicoEvolucao} dataKey="peso" name="Peso (kg)" color={themeStyles.weightColor} />
                        </Paper>
                    </Grid>
                    {/* Gráfico de Linha: Gordura Corporal */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, backgroundColor: themeStyles.darkBackground }}>
                            <EvolucaoLineChart data={historicoEvolucao} dataKey="gorduraCorporal" name="Gordura Corporal (%)" color={themeStyles.fatColor} />
                        </Paper>
                    </Grid>
                    {/* Gráfico de Linha: Musculatura */}
                    <Grid item xs={12} md={6} lg={4}>
                        <Paper elevation={3} sx={{ p: 2, backgroundColor: themeStyles.darkBackground }}>
                            <EvolucaoLineChart data={historicoEvolucao} dataKey="musculatura" name="Musculatura (%)" color={themeStyles.muscleColor} />
                        </Paper>
                    </Grid>

                    {/* Linha 2: Gráficos de Comparação (Barras) */}
                    <Grid item xs={12}>
                        <Divider sx={{ my: 4, bgcolor: themeStyles.lightText + '30' }} />
                        <Typography variant="h6" sx={{ color: themeStyles.lightText, mb: 2 }}>Comparação entre Últimas Avaliações</Typography>
                    </Grid>
                    
                    {podePlotarComparacao ? (
                        <>
                            {/* Gráfico de Barras: Peso */}
                            <Grid item xs={12} md={6} lg={4}>
                                <Paper elevation={3} sx={{ p: 2, backgroundColor: themeStyles.darkBackground }}>
                                    <ComparisonBarChart historicoData={historicoEvolucao} dataKey="peso" name="Peso (kg)" color={themeStyles.weightColor} />
                                </Paper>
                            </Grid>
                            {/* Gráfico de Barras: Gordura Corporal */}
                            <Grid item xs={12} md={6} lg={4}>
                                <Paper elevation={3} sx={{ p: 2, backgroundColor: themeStyles.darkBackground }}>
                                    <ComparisonBarChart historicoData={historicoEvolucao} dataKey="gorduraCorporal" name="Gordura Corporal (%)" color={themeStyles.fatColor} />
                                </Paper>
                            </Grid>
                            {/* Gráfico de Barras: Musculatura */}
                            <Grid item xs={12} md={6} lg={4}>
                                <Paper elevation={3} sx={{ p: 2, backgroundColor: themeStyles.darkBackground }}>
                                    <ComparisonBarChart historicoData={historicoEvolucao} dataKey="musculatura" name="Musculatura (%)" color={themeStyles.muscleColor} />
                                </Paper>
                            </Grid>
                        </>
                    ) : (
                        <Grid item xs={12}>
                             <Typography sx={{ color: themeStyles.lightText + '80', textAlign: 'center', py: 3 }}>
                                Pelo menos 2 avaliações são necessárias para a comparação por barras.
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            )}
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default NovaEvolucao;