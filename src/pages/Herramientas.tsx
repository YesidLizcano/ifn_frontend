import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  Button,
  TextField,
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
  Chip,
  Autocomplete
} from '@mui/material';
import { listarHerramientas, crearHerramienta, actualizarHerramienta, eliminarHerramienta, Herramienta as HerramientaService } from '../services/core';

// Interfaces para los datos
interface Herramienta {
  id: string;
  nombre: string;
  cantidadTotal: number;
  disponibles: number;
  ocupadas: number;
  departamento: string;
  departamento_id: number;
  fechaCreacion: string;
}

const DEPARTAMENTOS_COLOMBIA = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas", "Caquetá",
  "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca", "Guainía", "Guaviare",
  "Huila", "La Guajira", "Magdalena", "Meta", "Nariño", "Norte de Santander", "Putumayo",
  "Quindío", "Risaralda", "San Andrés y Providencia", "Santander", "Sucre", "Tolima",
  "Valle del Cauca", "Vaupés", "Vichada"
];

// Componentes de íconos alternativos
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
  const [selectedHerramienta, setSelectedHerramienta] = useState<Herramienta | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'delete'>('create');
  const [editData, setEditData] = useState<Partial<Herramienta>>({});
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | null>(null);

  // Datos del formulario para nueva herramienta
  const [nuevaHerramienta, setNuevaHerramienta] = useState({
    nombre: '',
    cantidadTotal: 0
  });

  // Cargar herramientas cuando cambia el departamento seleccionado
  useEffect(() => {
    const cargarHerramientas = async () => {
      if (!selectedDepartment) {
        setHerramientas([]);
        setSelectedDepartmentId(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || '';
        const data = await listarHerramientas(selectedDepartment, token);
        
        // Intentar obtener el ID del departamento de los datos
        if (data.length > 0) {
          setSelectedDepartmentId(data[0].departamento_id);
        } else {
          // Si no hay herramientas, intentamos inferir el ID por el índice (fallback)
          // Asumiendo que los IDs de departamentos son secuenciales y alfabéticos 1-32
          const index = DEPARTAMENTOS_COLOMBIA.indexOf(selectedDepartment);
          if (index !== -1) {
            setSelectedDepartmentId(index + 1);
          }
        }

        // Mapear respuesta del backend a la interfaz local
        const mapped: Herramienta[] = data.map((h: HerramientaService) => ({
          id: h.id.toString(),
          nombre: h.nombre,
          cantidadTotal: h.cantidad,
          disponibles: h.cantidad, // Asumimos que inicialmente todas están disponibles
          ocupadas: 0, 
          departamento: selectedDepartment,
          departamento_id: h.departamento_id,
          fechaCreacion: new Date().toISOString()
        }));
        
        setHerramientas(mapped);
      } catch (error) {
        console.error('Error cargando herramientas:', error);
        setHerramientas([]);
      } finally {
        setLoading(false);
      }
    };

    cargarHerramientas();
  }, [selectedDepartment]);

  // Filtrar herramientas (actualmente solo muestra todas las del departamento seleccionado)
  const filteredHerramientas = herramientas;

  // Manejar diálogos
  const handleOpenDialog = (herramienta: Herramienta | null, type: 'create' | 'edit' | 'delete') => {
    setSelectedHerramienta(herramienta);
    setDialogType(type);
    
    if (herramienta && type === 'edit') {
      setEditData({
        nombre: herramienta.nombre,
        cantidadTotal: herramienta.cantidadTotal,
        departamento: herramienta.departamento,
        departamento_id: herramienta.departamento_id
      });
    } else if (type === 'create') {
      setEditData({
        nombre: '',
        cantidadTotal: 0,
        departamento: selectedDepartment || ''
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

  // Nota: la lógica de aplicación de deltas (valores negativos) se delega al backend.
  // Aquí solo almacenamos lo que el usuario escribe en `editData.cantidadTotal` y lo enviamos tal cual.

  // Guardar nueva herramienta
  const handleGuardarNuevaHerramienta = async () => {
    if (nuevaHerramienta.nombre.trim() && nuevaHerramienta.cantidadTotal > 0 && selectedDepartmentId) {
      try {
        const token = localStorage.getItem('access_token') || '';
        await crearHerramienta(
          selectedDepartmentId,
          nuevaHerramienta.nombre,
          nuevaHerramienta.cantidadTotal,
          token
        );
        
        // Recargar herramientas
        const data = await listarHerramientas(selectedDepartment!, token);
        const mapped: Herramienta[] = data.map((h: HerramientaService) => ({
          id: h.id.toString(),
          nombre: h.nombre,
          cantidadTotal: h.cantidad,
          disponibles: h.cantidad,
          ocupadas: 0,
          departamento: selectedDepartment!,
          departamento_id: h.departamento_id,
          fechaCreacion: new Date().toISOString()
        }));
        setHerramientas(mapped);
        
        setNuevaHerramienta({ nombre: '', cantidadTotal: 0 });
      } catch (error) {
        console.error('Error creando herramienta:', error);
        alert('Error al crear la herramienta');
      }
    } else {
      if (!selectedDepartmentId) {
        alert('Seleccione un departamento válido primero');
      }
    }
  };

  // Guardar cambios de edición
  const handleSave = async () => {
    if (selectedHerramienta && dialogType === 'edit') {
      try {
        const token = localStorage.getItem('access_token') || '';

        // Determinar el ID del departamento
        let depId = editData.departamento_id;

        // Si el departamento cambió, buscar el nuevo ID
        if (editData.departamento && editData.departamento !== selectedHerramienta.departamento) {
          const index = DEPARTAMENTOS_COLOMBIA.indexOf(editData.departamento);
          if (index !== -1) depId = index + 1;
        }

        // Fallback si no tenemos ID
        if (!depId) {
          const index = DEPARTAMENTOS_COLOMBIA.indexOf(editData.departamento || selectedHerramienta.departamento);
          if (index !== -1) depId = index + 1;
        }

        if (!depId) {
          alert("No se pudo determinar el ID del departamento");
          return;
        }

        // Enviar la cantidad tal cual el usuario la ingresó (puede ser negativa para indicar delta).
        const payloadCantidad = editData.cantidadTotal !== undefined && editData.cantidadTotal !== null
          ? Number(editData.cantidadTotal)
          : selectedHerramienta.cantidadTotal;

        // Log payload to help debug 400 responses from backend
        const payloadToSend = {
          nombre: editData.nombre || selectedHerramienta.nombre,
          cantidad: payloadCantidad,
          departamento_id: depId
        };
        console.debug('PATCH /materiales_equipos payload:', payloadToSend);

        // Llamar al endpoint de actualización y capturar la respuesta
        const updated = await actualizarHerramienta(
          parseInt(selectedHerramienta.id),
          payloadToSend.nombre,
          payloadToSend.cantidad,
          payloadToSend.departamento_id,
          token
        );

        // Mostrar resultado (detalle) devuelto por el backend al usuario
        try {
          const detalle = updated && typeof updated === 'object' ? JSON.stringify(updated) : String(updated);
          alert(`Actualización realizada correctamente. Respuesta servidor: ${detalle}`);
        } catch (e) {
          alert('Actualización realizada correctamente.');
        }

        // Recargar herramientas desde backend para reflejar el estado real
        try {
          const fresh = await listarHerramientas(selectedDepartment || '', token);
          const mappedFresh: Herramienta[] = fresh.map((h: HerramientaService) => ({
            id: h.id.toString(),
            nombre: h.nombre,
            cantidadTotal: h.cantidad,
            disponibles: h.cantidad,
            ocupadas: 0,
            departamento: selectedDepartment || '',
            departamento_id: h.departamento_id,
            fechaCreacion: new Date().toISOString()
          }));
          setHerramientas(mappedFresh);
        } catch (e) {
          console.warn('No se pudo recargar la lista tras la actualización:', e);
        }
      } catch (error) {
        console.error('Error actualizando herramienta:', error);
        const msg = (error as any)?.message || JSON.stringify(error) || 'Error al actualizar la herramienta';
        // Mostrar detalle proveniente del backend cuando sea posible
        alert(`Error al actualizar la herramienta: ${msg}`);
      }
    }
    handleCloseDialog();
  };

  // Eliminar herramienta (llama al backend)
  const handleDelete = async () => {
    if (!selectedHerramienta) return;

    try {
      const token = localStorage.getItem('access_token') || '';
      const id = parseInt(selectedHerramienta.id);

      // Llamar al endpoint DELETE
      const resp = await eliminarHerramienta(id, token);

      // Mostrar resultado devuelto por el backend
      try {
        const detalle = resp && typeof resp === 'object' ? JSON.stringify(resp) : String(resp);
        alert(`Eliminación realizada. Respuesta servidor: ${detalle}`);
      } catch (e) {
        alert('Eliminación realizada correctamente.');
      }

      // Recargar lista desde backend para reflejar estado real
      try {
        const fresh = await listarHerramientas(selectedDepartment || '', token);
        const mappedFresh: Herramienta[] = fresh.map((h: HerramientaService) => ({
          id: h.id.toString(),
          nombre: h.nombre,
          cantidadTotal: h.cantidad,
          disponibles: h.cantidad,
          ocupadas: 0,
          departamento: selectedDepartment || '',
          departamento_id: h.departamento_id,
          fechaCreacion: new Date().toISOString()
        }));
        setHerramientas(mappedFresh);
      } catch (e) {
        console.warn('No se pudo recargar la lista tras la eliminación:', e);
        // Como fallback, eliminar localmente
        setHerramientas(prev => prev.filter(h => h.id !== selectedHerramienta.id));
      }

    } catch (error) {
      console.error('Error eliminando herramienta:', error);
      const msg = (error as any)?.message || JSON.stringify(error) || 'Error al eliminar la herramienta';
      alert(`Error al eliminar la herramienta: ${msg}`);
    } finally {
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
              <Autocomplete
                options={DEPARTAMENTOS_COLOMBIA}
                value={selectedDepartment}
                onChange={(event, newValue) => setSelectedDepartment(newValue)}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    label="Seleccionar Departamento" 
                    variant="outlined"
                    sx={{ 
                      width: 400,
                      backgroundColor: 'rgba(255,255,255,0.9)'
                    }}
                  />
                )}
                sx={{ width: 400 }}
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
                disabled={!selectedDepartment}
              />
              
              <TextField
                label="Cantidad"
                type="number"
                value={nuevaHerramienta.cantidadTotal}
                onChange={(e) => setNuevaHerramienta(prev => ({ ...prev, cantidadTotal: parseInt(e.target.value) || 0 }))}
                sx={{ minWidth: 120 }}
                InputProps={{ inputProps: { min: 1 } }}
                disabled={!selectedDepartment}
              />
              
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleGuardarNuevaHerramienta}
                disabled={!nuevaHerramienta.nombre.trim() || nuevaHerramienta.cantidadTotal <= 0 || !selectedDepartmentId}
                sx={{ minWidth: 120 }}
              >
                Guardar
              </Button>
            </Box>
            {!selectedDepartmentId && selectedDepartment && (
               <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                 No se puede crear herramienta: ID de departamento no identificado.
               </Typography>
            )}
          </Card>

          {/* Sección 2: Tabla de herramientas */}
          <Card sx={{ p: 3, backgroundColor: 'rgba(248,248,248,0.9)' }}>
            <Typography variant="h5" gutterBottom sx={{ color: '#2E7D32', mb: 3 }}>
              Lista de Herramientas {selectedDepartment ? `- ${selectedDepartment}` : ''}
            </Typography>

            <TableContainer component={Paper} sx={{ backgroundColor: 'rgba(255,255,255,0.95)' }}>
              <Table>
                <TableHead>
                  <TableRow>
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
                  label="Cantidad (usa negativo para disminuir)"
                  type="number"
                  value={editData.cantidadTotal ?? ''}
                  onChange={(e) => handleEditChange('cantidadTotal', e.target.value === '' ? undefined : parseInt(e.target.value))}
                  sx={{ mb: 2 }}
                  InputProps={{ inputProps: {} }}
                  helperText={selectedHerramienta ? `Actual: ${selectedHerramienta.cantidadTotal}. Escribe -n para restar n unidades, o un número positivo para establecer el total.` : ''}
                />
                
                <Autocomplete
                  options={DEPARTAMENTOS_COLOMBIA}
                  value={editData.departamento || ''}
                  onChange={(event, newValue) => handleEditChange('departamento', newValue)}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      label="Departamento" 
                      fullWidth
                    />
                  )}
                />

                    {selectedHerramienta && (
                      <Box sx={{ mt: 2, p: 2, backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 1 }}>
                        <Typography variant="body2" color="textSecondary">
                          <strong>Nota:</strong> Puedes usar un valor negativo en "Cantidad" para disminuir el total. El sistema no permitirá que el total quede por debajo de las unidades ocupadas.
                        </Typography>
                        <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                          Actualmente hay {selectedHerramienta.ocupadas} herramientas ocupadas. Total actual: {selectedHerramienta.cantidadTotal}.
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
                disabled={(() => {
                  const nombreOk = !!editData.nombre?.trim();
                  const departamentoOk = !!editData.departamento?.trim();
                  const cantidadProvided = editData.cantidadTotal !== undefined && editData.cantidadTotal !== null && !Number.isNaN(Number(editData.cantidadTotal));
                  return !(nombreOk && departamentoOk && cantidadProvided);
                })()}
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