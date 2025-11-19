import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip
} from '@mui/material';

// Interfaces para los datos
interface Herramienta {
  id: string;
  nombre: string;
  cantidadTotal: number;
  disponibles: number;
  ocupadas: number;
  departamento: string;
  fechaCreacion: string;
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

const GestionarHerramientas: React.FC = () => {
  const [herramientas, setHerramientas] = useState<Herramienta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHerramienta, setSelectedHerramienta] = useState<Herramienta | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'delete'>('create');
  const [editData, setEditData] = useState<Partial<Herramienta>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Datos del formulario para nueva herramienta
  const [nuevaHerramienta, setNuevaHerramienta] = useState({
    nombre: '',
    cantidadTotal: 0,
    departamento: ''
  });

  // Simular carga de datos
  useEffect(() => {
    const cargarHerramientas = async () => {
      setLoading(true);
      try {
        // Datos de ejemplo
        const datosEjemplo: Herramienta[] = [
          {
            id: 'HERR-001',
            nombre: 'GPS Garmin',
            cantidadTotal: 15,
            disponibles: 8,
            ocupadas: 7,
            departamento: 'Amazonas',
            fechaCreacion: '2024-01-15'
          },
          {
            id: 'HERR-002',
            nombre: 'Cinta Métrica',
            cantidadTotal: 25,
            disponibles: 18,
            ocupadas: 7,
            departamento: 'Antioquia',
            fechaCreacion: '2024-01-20'
          },
          {
            id: 'HERR-003',
            nombre: 'Clinómetro',
            cantidadTotal: 10,
            disponibles: 6,
            ocupadas: 4,
            departamento: 'Cundinamarca',
            fechaCreacion: '2024-02-01'
          },
          {
            id: 'HERR-004',
            nombre: 'Brujula Silva',
            cantidadTotal: 20,
            disponibles: 12,
            ocupadas: 8,
            departamento: 'Valle del Cauca',
            fechaCreacion: '2024-02-10'
          },
          {
            id: 'HERR-005',
            nombre: 'Tablet de Campo',
            cantidadTotal: 8,
            disponibles: 3,
            ocupadas: 5,
            departamento: 'Santander',
            fechaCreacion: '2024-02-15'
          }
        ];
        
        setHerramientas(datosEjemplo);
      } catch (error) {
        console.error('Error cargando herramientas:', error);
      } finally {
        setLoading(false);
      }
    };

    cargarHerramientas();
  }, []);

  // Filtrar herramientas basado en la búsqueda
  const filteredHerramientas = herramientas.filter(herramienta =>
    herramienta.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    herramienta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    herramienta.departamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Manejar diálogos
  const handleOpenDialog = (herramienta: Herramienta | null, type: 'create' | 'edit' | 'delete') => {
    setSelectedHerramienta(herramienta);
    setDialogType(type);
    
    if (herramienta && type === 'edit') {
      setEditData({
        nombre: herramienta.nombre,
        cantidadTotal: herramienta.cantidadTotal,
        departamento: herramienta.departamento
      });
    } else if (type === 'create') {
      setEditData({
        nombre: '',
        cantidadTotal: 0,
        departamento: ''
      });
    }
    
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedHerramienta(null);
    setEditData({});
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

  // Guardar nueva herramienta
  const handleGuardarNuevaHerramienta = () => {
    if (nuevaHerramienta.nombre.trim() && nuevaHerramienta.cantidadTotal > 0 && nuevaHerramienta.departamento.trim()) {
      const nueva: Herramienta = {
        id: `HERR-${String(herramientas.length + 1).padStart(3, '0')}`,
        nombre: nuevaHerramienta.nombre,
        cantidadTotal: nuevaHerramienta.cantidadTotal,
        disponibles: nuevaHerramienta.cantidadTotal, // Inicialmente todas disponibles
        ocupadas: 0,
        departamento: nuevaHerramienta.departamento,
        fechaCreacion: new Date().toISOString().split('T')[0]
      };
      
      setHerramientas(prev => [...prev, nueva]);
      setNuevaHerramienta({ nombre: '', cantidadTotal: 0, departamento: '' });
    }
  };

  // Guardar cambios de edición
  const handleSave = () => {
    if (selectedHerramienta && dialogType === 'edit') {
      const nuevasOcupadas = selectedHerramienta.ocupadas;
      const nuevosDisponibles = (editData.cantidadTotal || 0) - nuevasOcupadas;
      
      setHerramientas(prev => 
        prev.map(herramienta => 
          herramienta.id === selectedHerramienta.id 
            ? { 
                ...herramienta,
                nombre: editData.nombre || '',
                cantidadTotal: editData.cantidadTotal || 0,
                disponibles: nuevosDisponibles >= 0 ? nuevosDisponibles : 0,
                departamento: editData.departamento || ''
              }
            : herramienta
        )
      );
    }
    handleCloseDialog();
  };

  // Eliminar herramienta
  const handleDelete = () => {
    if (selectedHerramienta) {
      setHerramientas(prev => 
        prev.filter(herramienta => herramienta.id !== selectedHerramienta.id)
      );
      handleCloseDialog();
    }
  };

  // Manejar cambio de página
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
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
        {/* Card principal */}
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
              Gestionar Herramientas
            </Typography>
            <Typography 
              variant="body1" 
              align="center" 
              color="textSecondary"
              sx={{ mb: 3 }}
            >
              Administre el inventario de herramientas del sistema
            </Typography>

            {/* Barra de búsqueda y estadísticas */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Buscar por ID, nombre o departamento..."
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
                  label={`Total: ${herramientas.length}`} 
                  variant="outlined" 
                  color="primary" 
                />
                <Chip 
                  label={`Disponibles: ${herramientas.reduce((sum, h) => sum + h.disponibles, 0)}`} 
                  variant="outlined" 
                  color="success" 
                />
                <Chip 
                  label={`Ocupadas: ${herramientas.reduce((sum, h) => sum + h.ocupadas, 0)}`} 
                  variant="outlined" 
                  color="warning" 
                />
              </Box>
            </Box>
          </Box>

          {/* Sección 1: Formulario para agregar nueva herramienta */}
          <Card sx={{ p: 3, mb: 4, backgroundColor: 'rgba(248,248,248,0.9)' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32', mb: 3 }}>
              Agregar Nueva Herramienta
            </Typography>
            
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <TextField
                label="Nombre"
                value={nuevaHerramienta.nombre}
                onChange={(e) => setNuevaHerramienta(prev => ({ ...prev, nombre: e.target.value }))}
                sx={{ minWidth: 200, flex: 1 }}
              />
              
              <TextField
                label="Cantidad"
                type="number"
                value={nuevaHerramienta.cantidadTotal}
                onChange={(e) => setNuevaHerramienta(prev => ({ ...prev, cantidadTotal: parseInt(e.target.value) || 0 }))}
                sx={{ minWidth: 120 }}
                InputProps={{ inputProps: { min: 1 } }}
              />
              
              <TextField
                label="Departamento"
                value={nuevaHerramienta.departamento}
                onChange={(e) => setNuevaHerramienta(prev => ({ ...prev, departamento: e.target.value }))}
                sx={{ minWidth: 200, flex: 1 }}
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleGuardarNuevaHerramienta}
                disabled={!nuevaHerramienta.nombre.trim() || nuevaHerramienta.cantidadTotal <= 0 || !nuevaHerramienta.departamento.trim()}
                sx={{ minWidth: 120 }}
              >
                Guardar
              </Button>
            </Box>
          </Card>

          {/* Sección 2: Tabla de herramientas */}
          <Card sx={{ p: 3, backgroundColor: 'rgba(248,248,248,0.9)' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32', mb: 3 }}>
              Lista de Herramientas
            </Typography>

            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>ID</strong></TableCell>
                    <TableCell><strong>Nombre</strong></TableCell>
                    <TableCell align="center"><strong>Cantidad Total</strong></TableCell>
                    <TableCell align="center"><strong>Disponibles</strong></TableCell>
                    <TableCell align="center"><strong>Ocupadas</strong></TableCell>
                    <TableCell><strong>Departamento</strong></TableCell>
                    <TableCell><strong>Fecha Creación</strong></TableCell>
                    <TableCell><strong>Acciones</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredHerramientas
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((herramienta) => (
                    <TableRow key={herramienta.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                          {herramienta.id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {herramienta.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={herramienta.cantidadTotal} 
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={herramienta.disponibles} 
                          color="success"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip 
                          label={herramienta.ocupadas} 
                          color="warning"
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {herramienta.departamento}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {formatFecha(herramienta.fechaCreacion)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            variant="outlined"
                            color="primary"
                            size="small"
                            startIcon={<EditIcon />}
                            onClick={() => handleOpenDialog(herramienta, 'edit')}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleOpenDialog(herramienta, 'delete')}
                          >
                            Eliminar
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Paginación */}
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredHerramientas.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />

            {/* Mensaje cuando no hay resultados */}
            {filteredHerramientas.length === 0 && (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="textSecondary">
                  No se encontraron herramientas
                </Typography>
              </Box>
            )}
          </Card>
        </Card>

        {/* Diálogo de Edición/Eliminación */}
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
            {dialogType === 'edit' && `Editar Herramienta ${selectedHerramienta?.id}`}
            {dialogType === 'delete' && 'Eliminar Herramienta'}
          </DialogTitle>
          <DialogContent>
            {selectedHerramienta && dialogType === 'delete' ? (
              <Alert severity="warning" sx={{ mt: 2 }}>
                ¿Está seguro que desea eliminar la herramienta {selectedHerramienta.id} - {selectedHerramienta.nombre}?
              </Alert>
            ) : (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  label="Nombre"
                  value={editData.nombre || ''}
                  onChange={(e) => handleEditChange('nombre', e.target.value)}
                  sx={{ mb: 2 }}
                />
                
                <TextField
                  fullWidth
                  label="Cantidad Total"
                  type="number"
                  value={editData.cantidadTotal || 0}
                  onChange={(e) => handleEditChange('cantidadTotal', parseInt(e.target.value) || 0)}
                  sx={{ mb: 2 }}
                  InputProps={{ inputProps: { min: 1 } }}
                />
                
                <TextField
                  fullWidth
                  label="Departamento"
                  value={editData.departamento || ''}
                  onChange={(e) => handleEditChange('departamento', e.target.value)}
                />

                {selectedHerramienta && (
                  <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                    <Typography variant="body2" color="textSecondary">
                      <strong>Nota:</strong> Al modificar la cantidad total, las herramientas disponibles se ajustarán automáticamente.
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Actualmente hay {selectedHerramienta.ocupadas} herramientas ocupadas.
                    </Typography>
                  </Box>
                )}
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
                  !editData.nombre?.trim() ||
                  !editData.cantidadTotal ||
                  editData.cantidadTotal <= 0 ||
                  !editData.departamento?.trim()
                }
              >
                Guardar Cambios
              </Button>
            )}
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GestionarHerramientas;