import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Container,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Button,
    Box,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid
} from '@mui/material';
import HistoryIcon from '@mui/icons-material/History';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';

// --- Estilos do Tema de Academia (Reutilizados) ---
const themeStyles = {
    primaryColor: '#ffc107', 
    darkBackground: '#1c1c1c',
    mediumBackground: '#292929',
    lightText: '#f0f0f0',
};

// Mapeamento dos campos para as colunas da tabela e PDF
// IMC removido. Ações removidas no JSX.
const medidasMap = [
    { key: 'peso', label: 'Peso (kg)', unit: 'kg' },
    { key: 'altura', label: 'Altura (m)', unit: 'm' },
    { key: 'bracoDireito', label: 'Braço D (cm)', unit: 'cm' },
    { key: 'bracoEsquerdo', label: 'Braço E (cm)', unit: 'cm' },
    { key: 'abdomen', label: 'Abdômen (cm)', unit: 'cm' },
    { key: 'cintura', label: 'Cintura (cm)', unit: 'cm' },
    { key: 'quadril', label: 'Quadril (cm)', unit: 'cm' },
    { key: 'gorduraCorporal', label: 'Gordura Corp. (%)', unit: '%' },
    { key: 'musculatura', label: 'Musculatura', unit: '' },
    // IMC removido daqui
];

// Mapeamento COMPLETO para o PDF
const medidasPDFCompleto = [
    { key: 'peso', label: 'Peso', unit: 'kg' },
    { key: 'altura', label: 'Altura', unit: 'm' },
    { key: 'indiceMassa', label: 'IMC', unit: '' }, // Incluído no PDF
    { key: 'gorduraCorporal', label: 'Gordura Corporal', unit: '%' },
    { key: 'gorduraVisceral', label: 'Gordura Visceral', unit: '' },
    { key: 'musculatura', label: 'Musculatura', unit: '' },
    { key: 'idadeCorporal', label: 'Idade Corporal', unit: 'anos' },
    { key: 'kcal', label: 'Kcal', unit: '' },
    { key: 'bracoDireito', label: 'Braço Direito', unit: 'cm' },
    { key: 'bracoEsquerdo', label: 'Braço Esquerdo', unit: 'cm' },
    { key: 'cochaDireita', label: 'Coxa Direita', unit: 'cm' },
    { key: 'cochaEsquerda', label: 'Coxa Esquerda', unit: 'cm' },
    { key: 'panturrilhaDireita', label: 'Panturrilha Direita', unit: 'cm' },
    { key: 'panturrilhaEsquerda', label: 'Panturrilha Esquerda', unit: 'cm' },
    { key: 'abdomen', label: 'Abdômen', unit: 'cm' },
    { key: 'cintura', label: 'Cintura', unit: 'cm' },
    { key: 'quadril', label: 'Quadril', unit: 'cm' },
    { key: 'busto', label: 'Busto', unit: 'cm' },
];


function HistoricoEvolucao() {
    const { id } = useParams();
    const [aluno, setAluno] = useState(null);
    const [historico, setHistorico] = useState([]);
    const [loading, setLoading] = useState(true);
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [anoSelecionado, setAnoSelecionado] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDados = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                
                // 1. Buscar histórico
                const resHistorico = await api.get(`/alunos/${id}/evolucao`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setHistorico(resHistorico.data.sort((a, b) => new Date(b.data) - new Date(a.data)));
                
                // 2. Buscar dados básicos do aluno
                const resAluno = await api.get(`/alunos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAluno(resAluno.data);

            } catch (err) {
                console.error('Erro ao buscar histórico:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDados();
    }, [id, navigate]);
    
    // Lógica de Filtro
    const dadosFiltrados = useMemo(() => {
        return historico.filter(evo => {
            const data = new Date(evo.data);
            const mesCorreto = data.getMonth() + 1;
            const anoCorreto = data.getFullYear();

            const matchMes = !mesSelecionado || mesCorreto === parseInt(mesSelecionado);
            const matchAno = !anoSelecionado || anoCorreto === parseInt(anoSelecionado);

            return matchMes && matchAno;
        });
    }, [historico, mesSelecionado, anoSelecionado]);

    // Opções de ano
    const anosDisponiveis = useMemo(() => {
        const anos = historico.map(evo => new Date(evo.data).getFullYear());
        return [...new Set(anos)].sort((a, b) => b - a);
    }, [historico]);


    // --- FUNÇÃO GERAR PDF ATUALIZADA ---
    const gerarPDF = () => {
        const doc = new jsPDF();
        let finalY = 20;

        doc.setFontSize(22);
        doc.setTextColor(50, 50, 50); // Cor escura
        doc.text(`Histórico de Evolução | ${aluno?.nome || 'Aluno'}`, 14, finalY);
        finalY += 10;
        
        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Filtros aplicados: ${mesSelecionado || 'Todos os meses'}, ${anoSelecionado || 'Todos os anos'}`, 14, finalY);
        finalY += 10;
        
        if (dadosFiltrados.length === 0) {
            doc.text('Nenhuma avaliação encontrada para os filtros.', 14, finalY);
        }

        dadosFiltrados.forEach((evo, index) => {
            // Título para cada avaliação
            const dataAvaliacao = new Date(evo.data).toLocaleDateString('pt-BR');
            doc.setFontSize(14);
            doc.setTextColor(themeStyles.primaryColor);
            doc.text(`Avaliação de ${dataAvaliacao} ${index === 0 ? '(Mais Recente)' : ''}`, 14, finalY + 5);
            
            // Dados da tabela de 2 colunas
            const medidas = medidasPDFCompleto.map(m => {
                const valor = evo[m.key] !== undefined && evo[m.key] !== null ? evo[m.key] : 'N/A';
                return [`${m.label}${m.unit ? ` (${m.unit})` : ''}`, valor];
            });

            autoTable(doc, {
                startY: finalY + 10,
                head: [['Medida', 'Valor']],
                body: medidas,
                theme: 'striped',
                headStyles: { 
                    fillColor: [30, 30, 30], // Cabeçalho escuro
                    textColor: 255, 
                    fontStyle: 'bold' 
                },
                styles: { fontSize: 10, halign: 'center' },
                columnStyles: { 
                    0: { halign: 'left', cellWidth: 80 }, 
                    1: { halign: 'center', cellWidth: 40 } 
                },
                margin: { left: 14, right: 14 }
            });

            finalY = doc.lastAutoTable.finalY + 15; // Atualiza a posição para o próximo item
            
            // Adicionar nova página se estiver perto do final (opcional, mas bom para histórico longo)
            if (finalY > doc.internal.pageSize.height - 30 && index < dadosFiltrados.length - 1) {
                doc.addPage();
                finalY = 20;
            }
        });

        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, doc.internal.pageSize.height - 10);

        doc.save(`historico_evolucao_${aluno?.nome || id}.pdf`);
    };
    // --- FIM FUNÇÃO GERAR PDF ATUALIZADA ---


    if (loading) return (
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress sx={{ color: themeStyles.primaryColor }} />
        </Box>
    );

    return (
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, p: { xs: 2, md: 4 } }}>
            <Container maxWidth="xl">
                
                {/* Título */}
                <Typography 
                    variant="h4" 
                    sx={{ 
                        color: themeStyles.primaryColor, 
                        fontWeight: 'bold', 
                        mb: 4, 
                        borderBottom: `3px solid ${themeStyles.primaryColor}`, 
                        pb: 1,
                        display: 'flex',
                        alignItems: 'center'
                    }}
                >
                    <HistoryIcon sx={{ mr: 1, fontSize: 32 }} />
                    Evolução Corporal de {aluno?.nome || 'Aluno'}
                </Typography>

                {/* --- Ações e Filtros --- */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: 2, mb: 4, flexWrap: 'wrap' }}>
                    
                    {/* Botões de Ação */}
                    <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                            variant="contained"
                            onClick={() => navigate(`/alunos/${id}/adicionarEvolucao`)}
                            startIcon={<AddCircleOutlineIcon />}
                            sx={{ 
                                backgroundColor: '#1e8449',
                                '&:hover': { backgroundColor: '#186a3b' },
                                color: themeStyles.lightText,
                                fontWeight: 'bold'
                            }}
                        >
                            Nova Avaliação
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={() => navigate('/alunos')}
                            startIcon={<ArrowBackIcon />}
                            sx={{ 
                                borderColor: themeStyles.lightText, 
                                color: themeStyles.lightText, 
                                '&:hover': { backgroundColor: `${themeStyles.lightText}10` }
                            }}
                        >
                            Voltar
                        </Button>
                        <Button
                            variant="contained"
                            onClick={gerarPDF}
                            startIcon={<PictureAsPdfIcon />}
                            sx={{ 
                                backgroundColor: '#943126', 
                                '&:hover': { backgroundColor: '#7b241c' },
                                color: themeStyles.lightText,
                                fontWeight: 'bold'
                            }}
                        >
                            Exportar PDF
                        </Button>
                    </Box>

                    {/* Filtros MUI */}
                    <Grid container spacing={2} sx={{ maxWidth: 400 }}>
                        <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ 
                                '& .MuiOutlinedInput-root': { color: themeStyles.lightText, '& fieldset': { borderColor: themeStyles.lightText + 'A0' } },
                                '& .MuiInputLabel-root': { color: themeStyles.lightText + 'A0' }
                            }}>
                                <InputLabel>Mês</InputLabel>
                                <Select
                                    value={mesSelecionado}
                                    label="Mês"
                                    onChange={(e) => setMesSelecionado(e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {[...Array(12).keys()].map(i => (
                                        <MenuItem key={i + 1} value={i + 1}>
                                            {new Date(0, i).toLocaleString('pt-BR', { month: 'long' })}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={6}>
                            <FormControl fullWidth size="small" sx={{ 
                                '& .MuiOutlinedInput-root': { color: themeStyles.lightText, '& fieldset': { borderColor: themeStyles.lightText + 'A0' } },
                                '& .MuiInputLabel-root': { color: themeStyles.lightText + 'A0' }
                            }}>
                                <InputLabel>Ano</InputLabel>
                                <Select
                                    value={anoSelecionado}
                                    label="Ano"
                                    onChange={(e) => setAnoSelecionado(e.target.value)}
                                >
                                    <MenuItem value="">Todos</MenuItem>
                                    {anosDisponiveis.map(ano => (
                                        <MenuItem key={ano} value={ano}>{ano}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Grid>
                    </Grid>
                </Box>

                {/* Tabela de Histórico Otimizada */}
                <Paper 
                    elevation={6} 
                    sx={{ 
                        backgroundColor: themeStyles.mediumBackground, 
                        borderRadius: 2, 
                        overflowX: 'auto' 
                    }}
                >
                    <TableContainer>
                        <Table stickyHeader sx={{ minWidth: 800 }} aria-label="histórico de evolução">
                            
                            {/* Cabeçalho da Tabela */}
                            <TableHead>
                                <TableRow sx={{ backgroundColor: themeStyles.darkBackground }}>
                                    <TableCell sx={{ color: themeStyles.primaryColor, fontWeight: 'bold' }}>Data</TableCell>
                                    {medidasMap.map(m => (
                                        <TableCell key={m.key} sx={{ color: themeStyles.primaryColor, fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                                            {m.label}
                                        </TableCell>
                                    ))}
                                    {/* Coluna de Ações Removida */}
                                </TableRow>
                            </TableHead>

                            {/* Corpo da Tabela */}
                            <TableBody>
                                {dadosFiltrados.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={medidasMap.length + 1} align="center" sx={{ color: themeStyles.lightText, py: 3 }}>
                                            Nenhuma avaliação encontrada para os filtros selecionados.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    dadosFiltrados.map((evo, index) => (
                                        <TableRow
                                            key={evo.id}
                                            sx={{ 
                                                '&:nth-of-type(odd)': { backgroundColor: '#2f2f2f' }, 
                                                '&:hover': { backgroundColor: '#383838' } 
                                            }}
                                        >
                                            {/* Data (Coluna de Destaque) */}
                                            <TableCell component="th" scope="row" sx={{ color: index === 0 ? themeStyles.primaryColor : themeStyles.lightText, fontWeight: index === 0 ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>
                                                {new Date(evo.data).toLocaleDateString('pt-BR')}
                                            </TableCell>
                                            
                                            {/* Dados das Medidas */}
                                            {medidasMap.map(m => (
                                                <TableCell key={m.key} sx={{ color: themeStyles.lightText, whiteSpace: 'nowrap' }}>
                                                    {evo[m.key]} {m.unit}
                                                </TableCell>
                                            ))}
                                            
                                            {/* Coluna de Ações Removida */}

                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Paper>

            </Container>
        </Box>
    );
}

export default HistoricoEvolucao;