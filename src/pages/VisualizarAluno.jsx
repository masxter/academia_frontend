import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Container,
    Typography,
    Paper,
    Grid,
    List,
    ListItem,
    ListItemText,
    Button,
    Box,
    CircularProgress,
    Divider,
    Chip,
} from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import BoyIcon from '@mui/icons-material/Boy';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';

// --- Estilos do Tema de Academia (Reutilizados) ---
const themeStyles = {
    primaryColor: '#ffc107', 
    darkBackground: '#1c1c1c',
    mediumBackground: '#292929',
    lightText: '#f0f0f0',
};

// Mapeamento de campos para labels legíveis e ícones
const camposDetalhes = [
    { 
        titulo: 'Informações Básicas', 
        icon: <BoyIcon sx={{ mr: 1, color: themeStyles.primaryColor }} />,
        medidas: [
            { campo: 'telefone', label: 'Telefone' },
            { campo: 'peso', label: 'Peso', unit: 'kg', important: true },
            { campo: 'altura', label: 'Altura', unit: 'm', important: true }
        ] 
    },
    { 
        titulo: 'Antropometria', 
        icon: <FitnessCenterIcon sx={{ mr: 1, color: themeStyles.primaryColor }} />,
        medidas: [
            { campo: 'bracoEsquerdo', label: 'Braço Esquerdo', unit: 'cm' },
            { campo: 'bracoDireito', label: 'Braço Direito', unit: 'cm' },
            { campo: 'cochaEsquerda', label: 'Coxa Esquerda', unit: 'cm' },
            { campo: 'cochaDireita', label: 'Coxa Direita', unit: 'cm' },
            { campo: 'abdomen', label: 'Abdômen', unit: 'cm' },
            { campo: 'panturrilhaEsquerda', label: 'Panturrilha Esquerda', unit: 'cm' },
            { campo: 'panturrilhaDireita', label: 'Panturrilha Direita', unit: 'cm' },
            { campo: 'cintura', label: 'Cintura', unit: 'cm' },
            { campo: 'quadril', label: 'Quadril', unit: 'cm' },
            { campo: 'busto', label: 'Busto', unit: 'cm' },
        ] 
    },
    { 
        titulo: 'Bioimpedância e Metabolismo', 
        icon: <LocalHospitalIcon sx={{ mr: 1, color: themeStyles.primaryColor }} />,
        medidas: [
            { campo: 'gorduraCorporal', label: 'Gordura Corporal', unit: '%' },
            { campo: 'gorduraVisceral', label: 'Gordura Visceral' },
            { campo: 'musculatura', label: 'Musculatura' },
            { campo: 'indiceMassa', label: 'Índice de Massa' },
            { campo: 'idadeCorporal', label: 'Idade Corporal', unit: 'anos' },
            { campo: 'kcal', label: 'Kcal', unit: 'kcal/dia' },
        ] 
    },
];

function VisualizarAluno() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [aluno, setAluno] = useState(null);

    useEffect(() => {
        const fetchAluno = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const res = await api.get(`/alunos/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAluno(res.data);
            } catch (err) {
                console.error('Erro ao buscar aluno:', err);
            }
        };

        fetchAluno();
    }, [id, navigate]);

    // Função PDF (mantida com a mesma lógica, mas com melhorias estéticas)
    const gerarPDF = () => {
        const doc = new jsPDF();
        
        // Dados Pessoais
        doc.setFontSize(22);
        doc.setTextColor(50, 50, 50); // Cor escura
        doc.text(`Ficha de Avaliação - ${aluno.nome}`, 14, 25);
        
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text(`Telefone: ${aluno.telefone}`, 14, 35);
        doc.text(`Status: ${aluno.ativo ? 'Ativo' : 'Inativo'}`, 14, 42);

        // Agrupa as medidas para a tabela do PDF
        const medidasPDF = [];
        camposDetalhes.forEach(grupo => {
            medidasPDF.push([{ content: grupo.titulo, colSpan: 2, styles: { fillColor: '#ffc107', textColor: '#1c1c1c', fontStyle: 'bold' } }]);
            grupo.medidas.forEach(m => {
                const valor = aluno[m.campo] !== undefined ? aluno[m.campo] : 'N/A';
                medidasPDF.push([`${m.label}${m.unit ? ` (${m.unit})` : ''}`, valor]);
            });
        });

        // Tabela com medidas
        autoTable(doc, {
            startY: 50,
            head: [['Medida', 'Valor']],
            body: medidasPDF,
            theme: 'striped', // Tema listrado
            headStyles: { fillColor: '#ffc107', textColor: '#1c1c1c' },
            styles: { fontSize: 10, halign: 'center' },
            columnStyles: { 0: { halign: 'left', cellWidth: 80 }, 1: { halign: 'center', cellWidth: 80 } },
            margin: { top: 10 }
        });

        // Rodapé
        doc.setFontSize(10);
        doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, 14, doc.internal.pageSize.height - 10);

        doc.save(`aluno_${aluno.nome.replace(/\s/g, '_')}_${id}.pdf`);
    };

    if (!aluno) return (
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <CircularProgress sx={{ color: themeStyles.primaryColor }} />
        </Box>
    );

    return (
        // Container principal com o fundo escuro do tema
        <Box sx={{ minHeight: '100vh', backgroundColor: themeStyles.darkBackground, p: { xs: 2, md: 4 } }}>
            <Container maxWidth="md">
                <Paper 
                    elevation={10} 
                    sx={{ 
                        p: { xs: 3, sm: 5 }, 
                        backgroundColor: themeStyles.mediumBackground, 
                        color: themeStyles.lightText, 
                        borderRadius: 3 
                    }}
                >
                    {/* Título e Botão PDF */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                        <Typography 
                            variant="h4" 
                            sx={{ color: themeStyles.primaryColor, fontWeight: 'bold' }}
                        >
                            {aluno.nome}
                        </Typography>
                        
                        <Button 
                            variant="contained" 
                            startIcon={<FileDownloadIcon />}
                            onClick={gerarPDF}
                            sx={{ 
                                backgroundColor: themeStyles.primaryColor, 
                                color: themeStyles.darkBackground, 
                                '&:hover': { backgroundColor: '#e0a800' }, 
                                fontWeight: 'bold'
                            }}
                        >
                            Baixar Ficha (PDF)
                        </Button>
                    </Box>
                    
                    <Divider sx={{ mb: 3, bgcolor: themeStyles.primaryColor }} />
                    
                    {/* Status Ativo/Inativo */}
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography variant="h6" component="span" sx={{ fontWeight: 'normal' }}>
                            Status:
                        </Typography>
                        <Chip
                            label={aluno.ativo ? 'ATIVO' : 'INATIVO'}
                            sx={{
                                backgroundColor: aluno.ativo ? '#1e8449' : '#943126',
                                color: '#fff',
                                fontWeight: 'bold',
                                fontSize: '1rem',
                                padding: '5px 10px'
                            }}
                        />
                    </Box>

                    {/* Divisão dos Detalhes em Colunas e Grupos */}
                    <Grid container spacing={4}>
                        {camposDetalhes.map((grupo, index) => (
                            <Grid item xs={12} sm={6} key={index}>
                                <Box sx={{ mb: 2, borderBottom: `2px solid ${themeStyles.primaryColor}`, pb: 1 }}>
                                    <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: themeStyles.lightText, fontWeight: 'bold' }}>
                                        {grupo.icon}
                                        {grupo.titulo}
                                    </Typography>
                                </Box>
                                
                                <List dense sx={{ 
                                    '& .MuiListItem-root': { 
                                        borderBottom: `1px dashed ${themeStyles.lightText}30`, 
                                        py: 1 
                                    } 
                                }}>
                                    {grupo.medidas.map((item) => (
                                        <ListItem key={item.campo} disablePadding>
                                            <ListItemText 
                                                primary={<span style={{ fontWeight: item.important ? 'bold' : 'normal' }}>{item.label}:</span>}
                                                secondary={`${aluno[item.campo]} ${item.unit || ''}`}
                                                secondaryTypographyProps={{ 
                                                    color: item.important ? themeStyles.primaryColor : themeStyles.lightText, 
                                                    fontWeight: item.important ? 'bold' : 'normal',
                                                    fontSize: item.important ? '1.1rem' : '1rem'
                                                }}
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                            </Grid>
                        ))}
                    </Grid>
                </Paper>
            </Container>
        </Box>
    );
}

export default VisualizarAluno;