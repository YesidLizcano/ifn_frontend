import React, { useState } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  Paper,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  FormControl,
  InputLabel,
  Select,
  Alert
} from '@mui/material';
import { useNotification } from '../context/NotificationContext';

// Interfaces para los datos
interface Reporte {
  id: string;
  tipo: string;
  fechaGeneracion: string;
  estado: 'completado' | 'procesando' | 'error';
  descripcion: string;
  descargable: boolean;
}

interface Estadistica {
  label: string;
  valor: number;
  variacion?: number;
  icono?: string;
}

// Componentes de íconos alternativos
const DownloadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
  </svg>
);

const VisibilityIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);

const ReportIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
  </svg>
);

const VisualizarReportes: React.FC = () => {
  const { showNotification } = useNotification();
  const [filtroTipo, setFiltroTipo] = useState<string>('todos');
  const [fechaInicio, setFechaInicio] = useState<string>('');
  const [fechaFin, setFechaFin] = useState<string>('');
  const [reporteSeleccionado, setReporteSeleccionado] = useState<string>('');

  // Datos de ejemplo para reportes
  const [reportes] = useState<Reporte[]>([
    {
      id: 'REP-001',
      tipo: 'Conglomerados por Departamento',
      fechaGeneracion: '2024-01-20',
      estado: 'completado',
      descripcion: 'Reporte de conglomerados agrupados por departamento',
      descargable: true
    },
    {
      id: 'REP-002',
      tipo: 'Estado de Brigadas',
      fechaGeneracion: '2024-01-19',
      estado: 'completado',
      descripcion: 'Estado actual de todas las brigadas del sistema',
      descargable: true
    },
    {
      id: 'REP-003',
      tipo: 'Inventario de Herramientas',
      fechaGeneracion: '2024-01-18',
      estado: 'completado',
      descripcion: 'Inventario completo de herramientas disponibles',
      descargable: true
    },
    {
      id: 'REP-004',
      tipo: 'Reporte de Avance Mensual',
      fechaGeneracion: '2024-01-17',
      estado: 'procesando',
      descripcion: 'Reporte de avance de investigaciones del mes',
      descargable: false
    },
    {
      id: 'REP-005',
      tipo: 'Análisis de Cobertura Boscosa',
      fechaGeneracion: '2024-01-16',
      estado: 'error',
      descripcion: 'Análisis detallado de cobertura boscosa por región',
      descargable: false
    }
  ]);

  // Estadísticas de ejemplo
  const [estadisticas] = useState<Estadistica[]>([
    { label: 'Total Conglomerados', valor: 156, variacion: 12, icono: '📊' },
    { label: 'Brigadas Activas', valor: 8, variacion: 2, icono: '👥' },
    { label: 'Herramientas Disponibles', valor: 89, variacion: -5, icono: '🛠️' },
    { label: 'Reportes Generados', valor: 24, variacion: 8, icono: '📈' }
  ]);

  // Tipos de reportes disponibles
  const tiposReporte = [
    'Todos los reportes',
    'Conglomerados por Departamento',
    'Estado de Brigadas',
    'Inventario de Herramientas',
    'Reporte de Avance Mensual',
    'Análisis de Cobertura Boscosa',
    'Reporte Financiero',
    'Estadísticas de Investigación'
  ];

  // Filtrar reportes basado en los filtros
  const reportesFiltrados = reportes.filter(reporte => {
    const cumpleTipo = filtroTipo === 'todos' || reporte.tipo === filtroTipo;
    const cumpleFecha = true; // Aquí podrías agregar lógica de filtrado por fecha
    
    return cumpleTipo && cumpleFecha;
  });

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'completado': return 'success';
      case 'procesando': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  // Función para formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  // Función para generar nuevo reporte
  const generarReporte = () => {
    if (reporteSeleccionado) {
      showNotification(`Generando reporte: ${reporteSeleccionado}`, 'info');
      // Aquí iría la lógica real para generar el reporte
    }
  };

  // Función para descargar reporte
  const descargarReporte = (reporteId: string) => {
    showNotification(`Descargando reporte: ${reporteId}`, 'info');
    // Aquí iría la lógica real para descargar el reporte
  };

  return (
    <Box 
      sx={{ 
        flex: 1,
        backgroundImage: 'url("/images/fondo.png")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        py: 3,
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="xl">
        <Card sx={{ 
          p: 3, 
          backgroundColor: 'rgba(255,255,255,0.5)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)'
        }}>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h4" 
              align="center" 
              gutterBottom 
              sx={{ 
                fontWeight: 'bold', 
                color: '#2E7D32',
                mb: 1
              }}
            >
              Reportes y Estadísticas
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Visualice y genere reportes del sistema IFN
            </Typography>
          </Box>

          {/* Sección 1: Estadísticas rápidas */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            mb: 4,
            justifyContent: 'center'
          }}>
            {estadisticas.map((estadistica, index) => (
              <Box 
                key={index}
                sx={{ 
                  width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(25% - 12px)' },
                  minWidth: 250,
                  maxWidth: 300
                }}
              >
                <Paper 
                  elevation={2}
                  sx={{ 
                    p: 3, 
                    textAlign: 'center',
                    backgroundColor: 'rgba(255,255,255,0.9)',
                    border: '1px solid rgba(46, 125, 50, 0.2)',
                    height: '100%'
                  }}
                >
                  <Typography variant="h3" sx={{ mb: 1 }}>
                    {estadistica.icono}
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 'bold', color: '#2E7D32', mb: 1 }}>
                    {estadistica.valor}
                  </Typography>
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                    {estadistica.label}
                  </Typography>
                  {estadistica.variacion && (
                    <Chip 
                      label={`${estadistica.variacion > 0 ? '+' : ''}${estadistica.variacion}%`}
                      color={estadistica.variacion > 0 ? 'success' : 'error'}
                      size="small"
                      variant="outlined"
                    />
                  )}
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Sección 2: Generar nuevo reporte */}
          <Card sx={{ p: 3, mb: 4, backgroundColor: 'rgba(248,248,248,0.9)' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32', mb: 3 }}>
              Generar Nuevo Reporte
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                flexWrap: 'wrap', 
                gap: 3,
                alignItems: { xs: 'stretch', md: 'flex-end' }
              }}>
                <FormControl sx={{ minWidth: { xs: '100%', md: 300 }, flex: 1 }}>
                  <InputLabel>Tipo de Reporte</InputLabel>
                  <Select
                    value={reporteSeleccionado}
                    label="Tipo de Reporte"
                    onChange={(e) => setReporteSeleccionado(e.target.value)}
                  >
                    {tiposReporte.map((tipo, index) => (
                      <MenuItem key={index} value={tipo}>
                        {tipo}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <TextField
                  label="Fecha Inicio"
                  type="date"
                  value={fechaInicio}
                  onChange={(e) => setFechaInicio(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: '100%', md: 200 } }}
                />
                
                <TextField
                  label="Fecha Fin"
                  type="date"
                  value={fechaFin}
                  onChange={(e) => setFechaFin(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ minWidth: { xs: '100%', md: 200 } }}
                />
              </Box>
              
              <Box>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<ReportIcon />}
                  onClick={generarReporte}
                  disabled={!reporteSeleccionado}
                  sx={{ minWidth: 200, width: { xs: '100%', sm: 'auto' } }}
                >
                  Generar Reporte
                </Button>
              </Box>
            </Box>
          </Card>

          {/* Sección 3: Filtros y tabla de reportes */}
          <Card sx={{ p: 3, backgroundColor: 'rgba(248,248,248,0.9)' }}>
            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ color: '#2E7D32', textAlign: { xs: 'center', md: 'left' } }}>
                Reportes Existentes
              </Typography>
              
              <TextField
                select
                label="Filtrar por tipo"
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                sx={{ minWidth: 250, width: { xs: '100%', md: 'auto' } }}
              >
                <MenuItem value="todos">Todos los tipos</MenuItem>
                {tiposReporte.slice(1).map((tipo, index) => (
                  <MenuItem key={index} value={tipo}>
                    {tipo}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID Reporte</strong></TableCell>
                    <TableCell><strong>Tipo</strong></TableCell>
                    <TableCell><strong>Descripción</strong></TableCell>
                    <TableCell><strong>Fecha Generación</strong></TableCell>
                    <TableCell align="center"><strong>Estado</strong></TableCell>
                    <TableCell align="center"><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportesFiltrados.map((reporte) => (
                    <TableRow key={reporte.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {reporte.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {reporte.tipo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="textSecondary">
                          {reporte.descripcion}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatFecha(reporte.fechaGeneracion)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={reporte.estado.toUpperCase()} 
                          color={getEstadoColor(reporte.estado) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<VisibilityIcon />}
                            onClick={() => showNotification(`Vista previa: ${reporte.id}`, 'info')}
                          >
                            Ver
                          </Button>
                          <Button
                            variant="outlined"
                            color="success"
                            size="small"
                            startIcon={<DownloadIcon />}
                            onClick={() => descargarReporte(reporte.id)}
                            disabled={!reporte.descargable}
                          >
                            Descargar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mensaje cuando no hay resultados */}
            {reportesFiltrados.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No se encontraron reportes con los filtros seleccionados
                </Typography>
              </Box>
            )}
          </Card>

          {/* Información adicional */}
          <Alert severity="info" sx={{ mt: 3 }}>
            <Typography variant="body2">
              <strong>Nota:</strong> Los reportes se generan en formato PDF y pueden tardar varios minutos en procesarse dependiendo de la cantidad de datos.
            </Typography>
          </Alert>
        </Card>
      </Container>
    </Box>
  );
};

export default VisualizarReportes;