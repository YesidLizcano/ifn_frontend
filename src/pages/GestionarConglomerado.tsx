import React, { useState, useEffect } from 'react';
import { listarConglomerados } from '../services/core';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  Chip,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Paper
} from '@mui/material';

// Interfaces para los datos
interface Conglomerado {
  id: string;
  latitud: number;
  longitud: number;
  departamento: string;
  municipio: string;
  region: string;
  tipo: string;
  fechaInicio: string;
  fechaFinAprox: string;
  investigado: boolean;
  estado: 'asignado' | 'pendiente' | 'completado' | 'cancelado';
  fechaCreacion: string;
  brigada?: string;
  observaciones?: string;
}

// Componentes de íconos alternativos
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const EditIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const SaveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"/>
  </svg>
);

const CalculateIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9.5 8.5H12v-1h1V12h-1v-1H9.5v1h-1V7.5h1v1zm4.5 7h-5v-1h5v1zm0-2.5h-5v-1h5v1zM18 16h-2v2h-1v-2h-2v-1h2v-2h1v2h2v1z"/>
  </svg>
);

const GestionarConglomerados: React.FC = () => {
  const [conglomerados, setConglomerados] = useState<Conglomerado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConglomerado, setSelectedConglomerado] = useState<Conglomerado | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'delete'>('view');
  const [editData, setEditData] = useState<Partial<Conglomerado>>({});

  // Cargar conglomerados desde backend
  useEffect(() => {
    const cargarConglomerados = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || '';
        const datos = await listarConglomerados(token);

        // Mapear respuesta a la interfaz local Conglomerado
        const mapped: Conglomerado[] = datos.map(d => ({
          id: `CONG-${d.municipio_nombre}`,
          latitud: d.latitud,
          longitud: d.longitud,
          departamento: d.departamento_nombre,
          municipio: d.municipio_nombre,
          region: d.region,
          // eliminamos tipo, investigado, brigada, fechaCreacion
          tipo: '',
          fechaInicio: d.fechaInicio || '',
          fechaFinAprox: d.fechaFinAprox || '',
          investigado: false,
          estado: (d.estado as any) || 'Sin Asignar',
          fechaCreacion: '',
        }));

        setConglomerados(mapped);
      } catch (error) {
        console.error('Error cargando conglomerados:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarConglomerados();
  }, []);

  // Filtrar conglomerados basado en la búsqueda
  const filteredConglomerados = conglomerados.filter(conglomerado =>
    conglomerado.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conglomerado.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conglomerado.municipio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conglomerado.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar diálogos
  const handleOpenDialog = (conglomerado: Conglomerado, type: 'view' | 'edit' | 'delete') => {
    setSelectedConglomerado(conglomerado);
    setDialogType(type);
    setEditData({
      fechaInicio: conglomerado.fechaInicio,
      fechaFinAprox: conglomerado.fechaFinAprox,
      investigado: conglomerado.investigado
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConglomerado(null);
    setEditData({});
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'asignado': return 'primary';
      case 'pendiente': return 'warning';
      case 'completado': return 'success';
      case 'cancelado': return 'error';
      default: return 'default';
    }
  };

  // Función para formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  // Calcular fecha fin aproximada (30 días después de la fecha inicio)
  const calcularFechaFin = (fechaInicio: string) => {
    const fecha = new Date(fechaInicio);
    fecha.setDate(fecha.getDate() + 30);
    return fecha.toISOString().split('T')[0];
  };

  // Manejar cambio en los campos editables
  const handleEditChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));

    // Si cambia la fecha inicio y NO está investigado, recalcular fecha fin
    if (field === 'fechaInicio' && !editData.investigado) {
      setEditData(prev => ({
        ...prev,
        fechaFinAprox: calcularFechaFin(value)
      }));
    }
  };

  // Guardar cambios
  const handleSave = () => {
    if (selectedConglomerado) {
      setConglomerados(prev => 
        prev.map(cong => 
          cong.id === selectedConglomerado.id 
            ? { ...cong, ...editData }
            : cong
        )
      );
      handleCloseDialog();
    }
  };

  // Eliminar conglomerado
  const handleDelete = () => {
    if (selectedConglomerado) {
      setConglomerados(prev => 
        prev.filter(cong => cong.id !== selectedConglomerado.id)
      );
      handleCloseDialog();
    }
  };

  if (loading) {
    return (
      <Box 
        sx={{ 
          flex: 1,
          backgroundImage: 'url("/images/fondo.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh'
        }}
      >
        <CircularProgress size={60} />
      </Box>
    );
  }

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
        {/* Card con menor opacidad para que se vea el fondo */}
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
              Gestionar Conglomerados
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Administre y realice seguimiento a todos los conglomerados del sistema
            </Typography>

            {/* Barra de búsqueda y estadísticas */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Buscar por ID, municipio, departamento o región..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  width: 400,
                  '& .MuiOutlinedInput-root': {
                    backgroundColor: 'rgba(255,255,255,0.9)'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={`Total: ${conglomerados.length}`} 
                  variant="outlined" 
                  color="primary" 
                />
                <Chip 
                  label={`Investigados: ${conglomerados.filter(c => c.investigado).length}`} 
                  variant="outlined" 
                  color="success" 
                />
                <Chip 
                  label={`Por investigar: ${conglomerados.filter(c => !c.investigado).length}`} 
                  variant="outlined" 
                  color="warning" 
                />
              </Box>
            </Box>
          </Box>

          {/* Tarjetas de conglomerados - Layout con flexbox */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            {filteredConglomerados.map((conglomerado) => (
              <Box 
                key={conglomerado.id}
                sx={{ 
                  width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)', lg: 'calc(25% - 18px)' },
                  minWidth: 280,
                  maxWidth: 400
                }}
              >
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 2, 
                    height: '100%',
                    border: conglomerado.investigado ? '2px solid #4CAF50' : '2px solid #FF9800',
                    borderRadius: 2,
                    backgroundColor: conglomerado.investigado ? 'rgba(248,255,248,0.95)' : 'rgba(255,248,240,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  {/* Header de la tarjeta */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                      {conglomerado.id}
                    </Typography>
                    <Chip 
                      label={conglomerado.estado} 
                      color={getEstadoColor(conglomerado.estado) as any}
                      size="small"
                    />
                  </Box>

                  {/* Información del conglomerado */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Municipio:</strong> {conglomerado.municipio}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Departamento:</strong> {conglomerado.departamento}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Región:</strong> {conglomerado.region}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Tipo:</strong> {conglomerado.tipo}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Coordenadas:</strong> {conglomerado.latitud.toFixed(4)}, {conglomerado.longitud.toFixed(4)}
                    </Typography>
                  </Box>

                  {/* Fechas */}
                  <Box sx={{ 
                    mb: 2, 
                    p: 1, 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    borderRadius: 1,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Fecha Inicio:</strong> {formatFecha(conglomerado.fechaInicio)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Fecha Fin Aprox:</strong> {formatFecha(conglomerado.fechaFinAprox)}
                    </Typography>
                  </Box>

                  {/* Estado de investigación */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body2" sx={{ mr: 1 }}>
                      <strong>Investigado:</strong>
                    </Typography>
                    <Chip 
                      label={conglomerado.investigado ? "SÍ" : "NO"} 
                      color={conglomerado.investigado ? "success" : "warning"}
                      size="small"
                    />
                  </Box>

                  {/* Brigada asignada */}
                  {conglomerado.brigada && (
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2">
                        <strong>Brigada:</strong> {conglomerado.brigada}
                      </Typography>
                    </Box>
                  )}

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(conglomerado, 'edit')}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDialog(conglomerado, 'delete')}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Mensaje cuando no hay resultados */}
          {filteredConglomerados.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No se encontraron conglomerados
              </Typography>
            </Box>
          )}
        </Card>

        {/* Diálogo de Edición */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="sm" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle>
            {dialogType === 'edit' && `Editar Conglomerado ${selectedConglomerado?.id}`}
            {dialogType === 'delete' && 'Eliminar Conglomerado'}
          </DialogTitle>
          <DialogContent>
            {selectedConglomerado && (
              <>
                {dialogType === 'edit' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Municipio: {selectedConglomerado.municipio}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Departamento: {selectedConglomerado.departamento}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Región: {selectedConglomerado.region}
                    </Typography>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={editData.investigado || false}
                          onChange={(e) => handleEditChange('investigado', e.target.checked)}
                          color="primary"
                        />
                      }
                      label="¿Está investigado?"
                      sx={{ mt: 2, mb: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Fecha Inicio"
                      type="date"
                      value={editData.fechaInicio || ''}
                      onChange={(e) => handleEditChange('fechaInicio', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ mb: 2 }}
                    />

                    {!editData.investigado && (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <TextField
                          fullWidth
                          label="Fecha Fin Aprox"
                          type="date"
                          value={editData.fechaFinAprox || ''}
                          onChange={(e) => handleEditChange('fechaFinAprox', e.target.value)}
                          InputLabelProps={{ shrink: true }}
                        />
                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<CalculateIcon />}
                          onClick={() => {
                            if (editData.fechaInicio) {
                              handleEditChange('fechaFinAprox', calcularFechaFin(editData.fechaInicio));
                            }
                          }}
                          title="Calcular fecha fin (30 días después)"
                        >
                          Calcular
                        </Button>
                      </Box>
                    )}

                    {editData.investigado && (
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        <strong>Fecha Fin Aprox:</strong> {formatFecha(editData.fechaFinAprox || '')}
                      </Typography>
                    )}
                  </Box>
                )}
                
                {dialogType === 'delete' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ¿Está seguro que desea eliminar el conglomerado {selectedConglomerado.id}?
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            {dialogType === 'edit' && (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
              >
                Guardar
              </Button>
            )}
            {dialogType === 'delete' && (
              <Button 
                variant="contained" 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GestionarConglomerados;