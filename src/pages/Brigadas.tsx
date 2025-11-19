import React, { useState, useEffect } from 'react';
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
  Paper,
  IconButton
} from '@mui/material';

// Interfaces para los datos
interface Brigada {
  id: string;
  jefeBrigada: string;
  auxiliarTecnico: string;
  botanico: string;
  coinvestigadores: string[];
  estado: 'activa' | 'inactiva' | 'asignada';
  fechaCreacion: string;
  conglomeradosAsignados?: string[];
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

const AddIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
  </svg>
);

const RemoveIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19 13H5v-2h14v2z"/>
  </svg>
);

const GestionarBrigadas: React.FC = () => {
  const [brigadas, setBrigadas] = useState<Brigada[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrigada, setSelectedBrigada] = useState<Brigada | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'delete' | 'create'>('view');
  const [editData, setEditData] = useState<Partial<Brigada>>({});
  const [nuevoCoinvestigador, setNuevoCoinvestigador] = useState('');

  // Simular carga de datos
  useEffect(() => {
    const cargarBrigadas = async () => {
      setLoading(true);
      try {
        // Datos de ejemplo
        const datosEjemplo: Brigada[] = [
          {
            id: 'BRG-001',
            jefeBrigada: 'Carlos Rodríguez',
            auxiliarTecnico: 'Ana Martínez',
            botanico: 'María González',
            coinvestigadores: ['Pedro López', 'Laura Ramírez', 'David Torres'],
            estado: 'activa',
            fechaCreacion: '2024-01-15',
            conglomeradosAsignados: ['CONG-001', 'CONG-002']
          },
          {
            id: 'BRG-002',
            jefeBrigada: 'Miguel Sánchez',
            auxiliarTecnico: 'Sofia Herrera',
            botanico: 'Juan Pérez',
            coinvestigadores: ['Carmen Díaz', 'Roberto Castro'],
            estado: 'asignada',
            fechaCreacion: '2024-01-20',
            conglomeradosAsignados: ['CONG-003']
          },
          {
            id: 'BRG-003',
            jefeBrigada: 'Elena Morales',
            auxiliarTecnico: 'Daniel Rojas',
            botanico: 'Patricia Silva',
            coinvestigadores: ['Andrés Mendoza', 'Natalia Vega', 'Oscar Ruiz'],
            estado: 'inactiva',
            fechaCreacion: '2024-02-01'
          }
        ];
        
        setBrigadas(datosEjemplo);
      } catch (error) {
        console.error('Error cargando brigadas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarBrigadas();
  }, []);

  // Filtrar brigadas basado en la búsqueda
  const filteredBrigadas = brigadas.filter(brigada =>
    brigada.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brigada.jefeBrigada.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brigada.auxiliarTecnico.toLowerCase().includes(searchTerm.toLowerCase()) ||
    brigada.botanico.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar diálogos
  const handleOpenDialog = (brigada: Brigada | null, type: 'view' | 'edit' | 'delete' | 'create') => {
    setSelectedBrigada(brigada);
    setDialogType(type);
    
    if (brigada && (type === 'edit' || type === 'view')) {
      setEditData({
        jefeBrigada: brigada.jefeBrigada,
        auxiliarTecnico: brigada.auxiliarTecnico,
        botanico: brigada.botanico,
        coinvestigadores: [...brigada.coinvestigadores],
        estado: brigada.estado
      });
    } else if (type === 'create') {
      setEditData({
        jefeBrigada: '',
        auxiliarTecnico: '',
        botanico: '',
        coinvestigadores: ['', ''], // Mínimo 2 coinvestigadores
        estado: 'activa'
      });
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedBrigada(null);
    setEditData({});
    setNuevoCoinvestigador('');
  };

  // Función para obtener el color del estado
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activa': return 'success';
      case 'asignada': return 'primary';
      case 'inactiva': return 'warning';
      default: return 'default';
    }
  };

  // Función para formatear fecha
  const formatFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO');
  };

  // Manejar cambio en los campos editables
  const handleEditChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Agregar coinvestigador
  const agregarCoinvestigador = () => {
    if (nuevoCoinvestigador.trim()) {
      setEditData(prev => ({
        ...prev,
        coinvestigadores: [...(prev.coinvestigadores || []), nuevoCoinvestigador.trim()]
      }));
      setNuevoCoinvestigador('');
    }
  };

  // Eliminar coinvestigador
  const eliminarCoinvestigador = (index: number) => {
    setEditData(prev => ({
      ...prev,
      coinvestigadores: prev.coinvestigadores?.filter((_, i) => i !== index)
    }));
  };

  // Guardar cambios
  const handleSave = () => {
    if (dialogType === 'create') {
      // Crear nueva brigada
      const nuevaBrigada: Brigada = {
        id: `BRG-${String(brigadas.length + 1).padStart(3, '0')}`,
        jefeBrigada: editData.jefeBrigada || '',
        auxiliarTecnico: editData.auxiliarTecnico || '',
        botanico: editData.botanico || '',
        coinvestigadores: editData.coinvestigadores?.filter(c => c.trim()) || [],
        estado: editData.estado || 'activa',
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      setBrigadas(prev => [...prev, nuevaBrigada]);
    } else if (selectedBrigada) {
      // Editar brigada existente
      setBrigadas(prev => 
        prev.map(brig => 
          brig.id === selectedBrigada.id 
            ? { 
                ...brig, 
                jefeBrigada: editData.jefeBrigada || '',
                auxiliarTecnico: editData.auxiliarTecnico || '',
                botanico: editData.botanico || '',
                coinvestigadores: editData.coinvestigadores?.filter(c => c.trim()) || [],
                estado: editData.estado || 'activa'
              }
            : brig
        )
      );
    }
    handleCloseDialog();
  };

  // Eliminar brigada
  const handleDelete = () => {
    if (selectedBrigada) {
      setBrigadas(prev => 
        prev.filter(brig => brig.id !== selectedBrigada.id)
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
              Gestionar Brigadas
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Administre y gestione todas las brigadas del sistema
            </Typography>

            {/* Barra de búsqueda y estadísticas */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Buscar por ID, jefe de brigada, auxiliar técnico o botánico..."
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
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenDialog(null, 'create')}
                >
                  Nueva Brigada
                </Button>
                <Chip 
                  label={`Total: ${brigadas.length}`} 
                  variant="outlined" 
                  color="primary" 
                />
                <Chip 
                  label={`Activas: ${brigadas.filter(b => b.estado === 'activa').length}`} 
                  variant="outlined" 
                  color="success" 
                />
                <Chip 
                  label={`Asignadas: ${brigadas.filter(b => b.estado === 'asignada').length}`} 
                  variant="outlined" 
                  color="primary" 
                />
              </Box>
            </Box>
          </Box>

          {/* Tarjetas de brigadas - Layout con flexbox */}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3,
            justifyContent: { xs: 'center', md: 'flex-start' }
          }}>
            {filteredBrigadas.map((brigada) => (
              <Box 
                key={brigada.id}
                sx={{ 
                  width: { xs: '100%', sm: 'calc(50% - 12px)', md: 'calc(33.333% - 16px)' },
                  minWidth: 320,
                  maxWidth: 400
                }}
              >
                <Paper 
                  elevation={3}
                  sx={{ 
                    p: 2, 
                    height: '100%',
                    border: `2px solid ${
                      brigada.estado === 'activa' ? '#4CAF50' : 
                      brigada.estado === 'asignada' ? '#2196F3' : '#FF9800'
                    }`,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  {/* Header de la tarjeta */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                      {brigada.id}
                    </Typography>
                    <Chip 
                      label={brigada.estado.toUpperCase()} 
                      color={getEstadoColor(brigada.estado) as any}
                      size="small"
                    />
                  </Box>

                  {/* Información de la brigada */}
                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Jefe de Brigada:</strong> {brigada.jefeBrigada}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Auxiliar Técnico:</strong> {brigada.auxiliarTecnico}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Botánico:</strong> {brigada.botanico}
                    </Typography>
                    
                    {/* Coinvestigadores */}
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                        Coinvestigadores ({brigada.coinvestigadores.length}):
                      </Typography>
                      {brigada.coinvestigadores.map((coinvestigador, index) => (
                        <Typography key={index} variant="body2" sx={{ pl: 1, fontSize: '0.8rem' }}>
                          • {coinvestigador}
                        </Typography>
                      ))}
                    </Box>
                  </Box>

                  {/* Información adicional */}
                  <Box sx={{ 
                    mb: 2, 
                    p: 1, 
                    backgroundColor: 'rgba(0,0,0,0.05)', 
                    borderRadius: 1,
                    border: '1px solid rgba(0,0,0,0.1)'
                  }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Fecha Creación:</strong> {formatFecha(brigada.fechaCreacion)}
                    </Typography>
                    {brigada.conglomeradosAsignados && brigada.conglomeradosAsignados.length > 0 && (
                      <Typography variant="body2">
                        <strong>Conglomerados:</strong> {brigada.conglomeradosAsignados.join(', ')}
                      </Typography>
                    )}
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(brigada, 'edit')}
                    >
                      Editar
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      size="small"
                      startIcon={<DeleteIcon />}
                      onClick={() => handleOpenDialog(brigada, 'delete')}
                    >
                      Eliminar
                    </Button>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>

          {/* Mensaje cuando no hay resultados */}
          {filteredBrigadas.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No se encontraron brigadas
              </Typography>
            </Box>
          )}
        </Card>

        {/* Diálogo de Edición/Creación */}
        <Dialog 
          open={dialogOpen} 
          onClose={handleCloseDialog} 
          maxWidth="md" 
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle>
            {dialogType === 'edit' && `Editar Brigada ${selectedBrigada?.id}`}
            {dialogType === 'create' && 'Crear Nueva Brigada'}
            {dialogType === 'delete' && 'Eliminar Brigada'}
          </DialogTitle>
          <DialogContent>
            {selectedBrigada && dialogType === 'delete' ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ¿Está seguro que desea eliminar la brigada {selectedBrigada.id}?
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
                {/* Campos principales */}
                <TextField
                  fullWidth
                  label="Jefe de Brigada"
                  value={editData.jefeBrigada || ''}
                  onChange={(e) => handleEditChange('jefeBrigada', e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Auxiliar Técnico"
                  value={editData.auxiliarTecnico || ''}
                  onChange={(e) => handleEditChange('auxiliarTecnico', e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Botánico"
                  value={editData.botanico || ''}
                  onChange={(e) => handleEditChange('botanico', e.target.value)}
                  sx={{ mb: 3 }}
                />

                {/* Coinvestigadores */}
                <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                  Coinvestigadores (mínimo 2)
                </Typography>
                
                {/* Lista de coinvestigadores existentes */}
                {editData.coinvestigadores?.map((coinvestigador, index) => (
                  <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Coinvestigador ${index + 1}`}
                      value={coinvestigador}
                      onChange={(e) => {
                        const nuevosCoinvestigadores = [...(editData.coinvestigadores || [])];
                        nuevosCoinvestigadores[index] = e.target.value;
                        handleEditChange('coinvestigadores', nuevosCoinvestigadores);
                      }}
                    />
                    {editData.coinvestigadores && editData.coinvestigadores.length > 2 && (
                      <IconButton 
                        color="error" 
                        onClick={() => eliminarCoinvestigador(index)}
                        sx={{ mt: 0.5 }}
                      >
                        <RemoveIcon />
                      </IconButton>
                    )}
                  </Box>
                ))}

                {/* Agregar nuevo coinvestigador */}
                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <TextField
                    fullWidth
                    label="Nuevo Coinvestigador"
                    value={nuevoCoinvestigador}
                    onChange={(e) => setNuevoCoinvestigador(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        agregarCoinvestigador();
                      }
                    }}
                  />
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={agregarCoinvestigador}
                    sx={{ mt: 0.5 }}
                  >
                    Agregar
                  </Button>
                </Box>

                {/* Estado de la brigada */}
                <TextField
                  fullWidth
                  select
                  label="Estado"
                  value={editData.estado || 'activa'}
                  onChange={(e) => handleEditChange('estado', e.target.value)}
                  sx={{ mt: 3 }}
                  SelectProps={{
                    native: true,
                  }}
                >
                  <option value="activa">Activa</option>
                  <option value="asignada">Asignada</option>
                  <option value="inactiva">Inactiva</option>
                </TextField>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            {dialogType === 'delete' ? (
              <Button 
                variant="contained" 
                color="error"
                startIcon={<DeleteIcon />}
                onClick={handleDelete}
              >
                Eliminar
              </Button>
            ) : (
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<SaveIcon />}
                onClick={handleSave}
                disabled={
                  !editData.jefeBrigada?.trim() ||
                  !editData.auxiliarTecnico?.trim() ||
                  !editData.botanico?.trim() ||
                  !editData.coinvestigadores ||
                  editData.coinvestigadores.filter(c => c.trim()).length < 2
                }
              >
                {dialogType === 'create' ? 'Crear Brigada' : 'Guardar Cambios'}
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GestionarBrigadas;