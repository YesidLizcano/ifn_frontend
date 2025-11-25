import React, { useState, useEffect } from 'react';
import {
  listarConglomerados,
  listarIntegrantesPorRegion,
  Integrante,
  asignarBrigada,
  BrigadaCrear,
} from '../services/core';
import { Autocomplete } from '@mui/material';
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
  Paper
} from '@mui/material';

// Interfaces para los datos
interface Conglomerado {
  id: string; // Se usará el ID numérico del backend, pero como string para consistencia
  latitud: number;
  longitud: number;
  departamento: string;
  municipio: string;
  region: string;
  fechaInicio: string;
  fechaFinAprox: string;
  municipio_id?: number;
  estado: 'asignado' | 'pendiente' | 'completado' | 'cancelado' | 'Sin Asignar';
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

// CalculateIcon removed — fecha fin se gestionará manualmente

const GestionarConglomerados: React.FC = () => {
  const [conglomerados, setConglomerados] = useState<Conglomerado[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConglomerado, setSelectedConglomerado] = useState<Conglomerado | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'edit' | 'delete' | 'assign' | 'assignDates'>('view');
  const [editData, setEditData] = useState<Partial<Conglomerado>>({});
  type BrigadaMember = Integrante | null;
  const [brigadaData, setBrigadaData] = useState<{ jefeBrigada: BrigadaMember; auxiliarTecnicos: BrigadaMember[]; botanicos: BrigadaMember[]; coinvestigadores: BrigadaMember[] }>({ jefeBrigada: null, auxiliarTecnicos: [null], botanicos: [null], coinvestigadores: [null, null] });
  const [integrantesByRole, setIntegrantesByRole] = useState<Record<string, Integrante[]>>({});
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);
  const [loadingAssign, setLoadingAssign] = useState(false);

  // Cargar conglomerados desde backend
  useEffect(() => {
    const cargarConglomerados = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('access_token') || '';
        const datos = await listarConglomerados(token);

        // Mapear respuesta a la interfaz local Conglomerado
        const mapped: Conglomerado[] = datos.map(d => ({
          id: String(d.id), // Usar el ID numérico del backend como string
          latitud: d.latitud,
          longitud: d.longitud,
          departamento: d.departamento_nombre,
          municipio: d.municipio_nombre,
          region: d.region,
          fechaInicio: d.fechaInicio || '',
          fechaFinAprox: d.fechaFinAprox || '',
          municipio_id: d.municipio_id ?? undefined,
          estado: (d.estado as any) || 'Sin Asignar',
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
  const handleOpenDialog = (conglomerado: Conglomerado, type: 'view' | 'edit' | 'delete' | 'assign' | 'assignDates') => {
    setSelectedConglomerado(conglomerado);
    setDialogType(type);
    if (type === 'assign') {
      // Inicializar datos de brigada al asignar (ahora con arrays)
      setBrigadaData({ jefeBrigada: null, auxiliarTecnicos: [null], botanicos: [null], coinvestigadores: [null, null] });
      // limpiar integrantes anteriores
      setIntegrantesByRole({});
    } else if (type === 'assignDates') {
      setEditData({
        fechaInicio: conglomerado.fechaInicio,
        fechaFinAprox: conglomerado.fechaFinAprox
      });
    } else {
      setEditData({
        fechaInicio: conglomerado.fechaInicio,
        fechaFinAprox: conglomerado.fechaFinAprox
      });
    }
    setDialogOpen(true);
  };

  // Cuando se abre el diálogo 'assign', obtener integrantes por rol (si hay departamento_id)
  useEffect(() => {
    const cargarIntegrantes = async () => {
      if (dialogType !== 'assign' || !selectedConglomerado) return;
      const departamentoNombre = selectedConglomerado.departamento;
      if (!departamentoNombre) {
        console.warn('No hay nombre de departamento en el conglomerado; no se podrán listar integrantes por región automáticamente');
        return;
      }

      const token = localStorage.getItem('access_token') || '';
      setLoadingIntegrantes(true);
      try {
        // Usar las fechas ingresadas por el usuario en el diálogo si existen en editData;
        // no persistimos en el array `conglomerados` hasta que la asignación sea confirmada.
        const inicio = (editData.fechaInicio as string) || selectedConglomerado.fechaInicio || '';
        const fin = (editData.fechaFinAprox as string) || selectedConglomerado.fechaFinAprox || '';

        const rolesToFetch = ['auxiliar', 'botanico', 'jefeBrigada', 'coinvestigador'];
        const results: Record<string, Integrante[]> = {};
        try {
          // El endpoint devuelve todos los integrantes para la región/fechas.
          // Filtraremos en el cliente por las flags booleanas: item['auxiliar'], item['botanico'], etc.
          const all = await listarIntegrantesPorRegion(departamentoNombre, inicio, fin, token);
          for (const rol of rolesToFetch) {
            results[rol] = (all || []).filter((it: any) => Boolean(it && it[rol]));
          }
        } catch (err) {
          console.warn('Error cargando integrantes por región:', err);
          for (const rol of rolesToFetch) results[rol] = [];
        }

        setIntegrantesByRole(results);
      } finally {
        setLoadingIntegrantes(false);
      }
    };

    cargarIntegrantes();
  }, [dialogType, selectedConglomerado, editData]);

  // Helpers para manejar arrays dinámicos en brigadaData
  const addArrayItem = (field: 'auxiliarTecnicos' | 'botanicos' | 'coinvestigadores') => {
    setBrigadaData(prev => ({ ...(prev as any), [field]: [...(prev as any)[field], null] }));
  };

  const removeArrayItem = (field: 'auxiliarTecnicos' | 'botanicos' | 'coinvestigadores', index: number) => {
    setBrigadaData(prev => {
      const arr = [...(prev as any)[field]];
      // mantener al menos 1 campo para auxiliares/botánicos, y 2 para coinvestigadores
      const min = field === 'coinvestigadores' ? 2 : 1;
      if (arr.length <= min) return prev; // mantener al menos min campos vacíos
      arr.splice(index, 1);
      return { ...(prev as any), [field]: arr };
    });
  };

  const updateArrayItem = (field: 'auxiliarTecnicos' | 'botanicos' | 'coinvestigadores', index: number, value: BrigadaMember) => {
    setBrigadaData(prev => {
      const arr = [...(prev as any)[field]];
      arr[index] = value;
      return { ...(prev as any), [field]: arr };
    });
  };

  const handleAssign = async () => {
    if (!selectedConglomerado || !selectedConglomerado.id) return;

    // 1. Validaciones
    if (!brigadaData.jefeBrigada?.id) {
      alert('Seleccione el jefe de brigada');
      return;
    }
    if (brigadaData.auxiliarTecnicos.filter(Boolean).length < 1) {
      alert('Debe asignar al menos un auxiliar técnico');
      return;
    }
    if (brigadaData.botanicos.filter(Boolean).length < 1) {
      alert('Debe asignar al menos un botánico');
      return;
    }
    if (brigadaData.coinvestigadores.filter(Boolean).length < 2) {
      alert('Debe asignar al menos dos coinvestigadores');
      return;
    }

    // 2. Construir el payload para la API
    const integrantes_asignados: { integrante_id: number; rol_asignado: string }[] = [];

    if (brigadaData.jefeBrigada.id) {
      integrantes_asignados.push({ integrante_id: brigadaData.jefeBrigada.id, rol_asignado: 'JEFE_BRIGADA' });
    }
    brigadaData.auxiliarTecnicos.forEach(a => {
      if (a?.id) integrantes_asignados.push({ integrante_id: a.id, rol_asignado: 'AUXILIAR' });
    });
    brigadaData.botanicos.forEach(b => {
      if (b?.id) integrantes_asignados.push({ integrante_id: b.id, rol_asignado: 'BOTANICO' });
    });
    brigadaData.coinvestigadores.forEach(c => {
      if (c?.id) integrantes_asignados.push({ integrante_id: c.id, rol_asignado: 'COINVESTIGADOR' });
    });

    const brigadaPayload: BrigadaCrear = {
      fechaCreacion: new Date().toISOString().split('T')[0], // Hoy
      estado: 'ACTIVA',
      fechaInicio: (editData.fechaInicio as string) || selectedConglomerado.fechaInicio,
      fechaFinAprox: (editData.fechaFinAprox as string) || selectedConglomerado.fechaFinAprox,
      integrantes_asignados,
    };

    // 3. Llamar al servicio
    setLoadingAssign(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      await asignarBrigada(Number(selectedConglomerado.id), brigadaPayload, token);

      // 4. Actualizar UI en caso de éxito
      setConglomerados(prev => prev.map(c => 
        c.id === selectedConglomerado.id 
          ? { ...c, estado: 'asignado', fechaInicio: brigadaPayload.fechaInicio, fechaFinAprox: brigadaPayload.fechaFinAprox } 
          : c
      ));
      
      alert('Brigada asignada con éxito');
      handleCloseDialog();

    } catch (error) {
      console.error('Error al asignar la brigada:', error);
      alert(`Error al asignar la brigada: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    } finally {
      setLoadingAssign(false);
    }
  };

  // Guardar fechas antes de abrir el diálogo de asignación
  const handleSaveDates = () => {
    if (!selectedConglomerado) return;
    const inicio = editData.fechaInicio as string | undefined;
    const fin = editData.fechaFinAprox as string | undefined;

    if (!inicio || !inicio.trim()) {
      alert('Ingrese una Fecha Inicio válida');
      return;
    }

    if (!fin || !fin.trim()) {
      alert('Ingrese una Fecha Fin Aprox válida');
      return;
    }

    // Validar que la fecha fin sea al menos 1 día después de la fecha inicio
    const dInicio = new Date(inicio);
    const dFin = new Date(fin);
    const diffMs = dFin.getTime() - dInicio.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;
    if (isNaN(dInicio.getTime()) || isNaN(dFin.getTime()) || diffMs < oneDayMs) {
      alert('La Fecha Fin Aprox debe ser al menos un día después de la Fecha Inicio');
      return;
    }

    // Cambiar al diálogo de asignación (sin cerrar).
    // No persistimos las fechas en `conglomerados` hasta la asignación final.
    setDialogType('assign');
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedConglomerado(null);
    setEditData({});
    setLoadingAssign(false); // Resetear estado de carga
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
    if (!fecha) return 'N/A';
    return new Date(fecha).toLocaleDateString('es-CO', { timeZone: 'UTC' });
  };

  // --- Lógica de exclusión entre selects: un integrante sólo puede ocupar una plaza ---
  const getSelectedIds = () => {
    const ids = new Set<number>();
    if (brigadaData.jefeBrigada && brigadaData.jefeBrigada.id) ids.add(brigadaData.jefeBrigada.id);
    brigadaData.auxiliarTecnicos.forEach(a => { if (a && a.id) ids.add(a.id); });
    brigadaData.botanicos.forEach(b => { if (b && b.id) ids.add(b.id); });
    brigadaData.coinvestigadores.forEach(c => { if (c && c.id) ids.add(c.id); });
    return ids;
  };

  const optionsFor = (role: string, current: BrigadaMember | null) => {
    const all = integrantesByRole[role] || [];
    const selected = getSelectedIds();
    return all.filter((it: Integrante) => {
      if (!it || !it.id) return false;
      // Si el integrante actual está siendo evaluado, siempre debe aparecer en la lista
      if (current && current.id === it.id) return true;
      // Si no, solo debe aparecer si no ha sido seleccionado en otro rol
      return !selected.has(it.id);
    });
  };

  const renderWithLoading = (label: string) => (params: any) => (
    <TextField
      {...params}
      label={label}
      fullWidth
      sx={{ mb: 0 }}
      InputProps={{
        ...params.InputProps,
        endAdornment: (
          <>
            {loadingIntegrantes ? <CircularProgress size={18} /> : null}
            {params.InputProps.endAdornment}
          </>
        )
      }}
    />
  );

  // Eliminada la función de cálculo automático de fecha fin — manejo manual por usuario

  // Manejar cambio en los campos editables
  const handleEditChange = (field: string, value: any) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
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
                    border: '1px solid rgba(0,0,0,0.08)',
                    borderRadius: 2,
                    backgroundColor: '#fff',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  {/* Header de la tarjeta */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#333' }}>
                      CONG-{conglomerado.municipio}
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
                    {/* Tipo eliminado del modelo */}
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

                  {/* Campos eliminados: investigado, brigada, tipo, fechaCreacion */}

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end', mt: 'auto' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenDialog(conglomerado, conglomerado.estado === 'Sin Asignar' ? 'assignDates' : 'edit')}
                    >
                      {conglomerado.estado === 'Sin Asignar' ? 'Asignar' : 'Editar'}
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
            {dialogType === 'edit' && `Editar Conglomerado CONG-${selectedConglomerado?.municipio}`}
            {dialogType === 'delete' && 'Eliminar Conglomerado'}
            {dialogType === 'assign' && `Asignar Brigada a CONG-${selectedConglomerado?.municipio}`}
            {dialogType === 'assignDates' && `Asignar Fechas a CONG-${selectedConglomerado?.municipio}`}
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

                    <TextField
                      fullWidth
                      label="Fecha Inicio"
                      type="date"
                      value={editData.fechaInicio || ''}
                      onChange={(e) => handleEditChange('fechaInicio', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ my: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Fecha Fin Aprox"
                      type="date"
                      value={editData.fechaFinAprox || ''}
                      onChange={(e) => handleEditChange('fechaFinAprox', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                )}

                {dialogType === 'assignDates' && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      Asigne las fechas para el conglomerado antes de continuar con la asignación de la brigada.
                    </Typography>
                    <TextField
                      fullWidth
                      label="Fecha Inicio"
                      type="date"
                      value={editData.fechaInicio || ''}
                      onChange={(e) => handleEditChange('fechaInicio', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                      sx={{ my: 2 }}
                    />

                    <TextField
                      fullWidth
                      label="Fecha Fin Aprox"
                      type="date"
                      value={editData.fechaFinAprox || ''}
                      onChange={(e) => handleEditChange('fechaFinAprox', e.target.value)}
                      InputLabelProps={{ shrink: true }}
                    />
                  </Box>
                )}
                {dialogType === 'assign' && (
                  <Box sx={{ mt: 2 }}>
                    {/* Jefe de brigada: select si hay resultados, fallback a texto */}
                    {/* Jefe de brigada: Autocomplete siempre visible, permite texto libre con freeSolo */}
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Jefe de Brigada</Typography>
                    <Autocomplete
                      options={optionsFor('jefeBrigada', brigadaData.jefeBrigada)}
                      getOptionLabel={(o: any) => (typeof o === 'string' ? o : (o?.nombreCompleto || o?.nombre || ''))}
                      value={brigadaData.jefeBrigada}
                      onChange={(_, v) => setBrigadaData(prev => ({ ...prev, jefeBrigada: v as BrigadaMember }))}
                      isOptionEqualToValue={(option, value) => option?.id === value?.id}
                      renderInput={renderWithLoading('Jefe de Brigada')}
                      sx={{ mb: 2 }}
                    />

                    {/* Auxiliares Técnicos */}
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Auxiliares Técnicos</Typography>
                    {brigadaData.auxiliarTecnicos.map((aux, index) => (
                      <Box key={`aux-${index}`} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <Autocomplete
                          options={optionsFor('auxiliar', aux)}
                          getOptionLabel={(o: any) => (typeof o === 'string' ? o : (o?.nombreCompleto || o?.nombre || ''))}
                          value={aux}
                          onChange={(_, v) => updateArrayItem('auxiliarTecnicos', index, v as BrigadaMember)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          renderInput={renderWithLoading(`Auxiliar Técnico #${index + 1}`)}
                          sx={{ flex: 1 }}
                        />
                        <Button size="small" variant="outlined" onClick={() => removeArrayItem('auxiliarTecnicos', index)}>-</Button>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => addArrayItem('auxiliarTecnicos')}>Agregar Auxiliar</Button>

                    {/* Botánicos */}
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Botánicos</Typography>
                    {brigadaData.botanicos.map((bot, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <Autocomplete
                          options={optionsFor('botanico', bot)}
                          getOptionLabel={(o: any) => (typeof o === 'string' ? o : (o?.nombreCompleto || o?.nombre || ''))}
                          value={bot}
                          onChange={(_, v) => updateArrayItem('botanicos', index, v as BrigadaMember)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          renderInput={renderWithLoading(`Botánico #${index + 1}`)}
                          sx={{ flex: 1 }}
                        />
                        <Button size="small" variant="outlined" onClick={() => removeArrayItem('botanicos', index)}>-</Button>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => addArrayItem('botanicos')}>Agregar Botánico</Button>

                    {/* Coinvestigadores */}
                    <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>Coinvestigadores</Typography>
                    {brigadaData.coinvestigadores.map((co, index) => (
                      <Box key={index} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                        <Autocomplete
                          options={optionsFor('coinvestigador', co)}
                          getOptionLabel={(o: any) => (typeof o === 'string' ? o : (o?.nombreCompleto || o?.nombre || ''))}
                          value={co}
                          onChange={(_, v) => updateArrayItem('coinvestigadores', index, v as BrigadaMember)}
                          isOptionEqualToValue={(option, value) => option?.id === value?.id}
                          renderInput={renderWithLoading(`Coinvestigador #${index + 1}`)}
                          sx={{ flex: 1 }}
                        />
                        <Button size="small" variant="outlined" onClick={() => removeArrayItem('coinvestigadores', index)}>-</Button>
                      </Box>
                    ))}
                    <Button size="small" onClick={() => addArrayItem('coinvestigadores')}>Agregar Coinvestigador</Button>
                  </Box>
                )}
                
                {dialogType === 'delete' && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    ¿Está seguro que desea eliminar el conglomerado CONG-{selectedConglomerado.municipio}?
                  </Alert>
                )}
              </>
            )}
          </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} disabled={loadingAssign}>Cancelar</Button>
              {dialogType === 'assignDates' && (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSaveDates}
                  disabled={
                    !editData.fechaInicio || !String(editData.fechaInicio).trim() ||
                    !editData.fechaFinAprox || !String(editData.fechaFinAprox).trim() ||
                    (() => {
                      const inicio = String(editData.fechaInicio || '');
                      const fin = String(editData.fechaFinAprox || '');
                      if (!inicio || !fin) return true;
                      const dInicio = new Date(inicio);
                      const dFin = new Date(fin);
                      if (isNaN(dInicio.getTime()) || isNaN(dFin.getTime())) return true;
                      return (dFin.getTime() - dInicio.getTime()) < (24 * 60 * 60 * 1000);
                    })()
                  }
                >
                  Siguiente
                </Button>
              )}
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
              {/* El botón 'Guardar Fechas' se elimina: se usa el botón 'Siguiente' dentro del contenido del diálogo.
                  Las fechas no se persisten en el array `conglomerados` hasta que la asignación sea confirmada. */}
              {dialogType === 'assign' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={loadingAssign ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  onClick={handleAssign}
                  disabled={loadingAssign || (
                    !(brigadaData.jefeBrigada && brigadaData.jefeBrigada.id) ||
                    brigadaData.auxiliarTecnicos.filter(a => a && a.id).length < 1 ||
                    brigadaData.botanicos.filter(b => b && b.id).length < 1 ||
                    brigadaData.coinvestigadores.filter(c => c && c.id).length < 2
                  )}
                >
                  {loadingAssign ? 'Asignando...' : 'Asignar Brigada'}
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