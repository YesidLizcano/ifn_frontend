import React, { useState, useEffect } from 'react';
import { listarConglomerados, listarIntegrantesPorRegion, Integrante } from '../services/core';
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
  id: string;
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
  const [brigadaData, setBrigadaData] = useState<{ jefeBrigada: BrigadaMember; auxiliarTecnicos: BrigadaMember[]; botanicos: BrigadaMember[]; coinvestigadores: BrigadaMember[] }>({ jefeBrigada: null, auxiliarTecnicos: [null], botanicos: [null], coinvestigadores: [null] });
  const [integrantesByRole, setIntegrantesByRole] = useState<Record<string, Integrante[]>>({});
  const [loadingIntegrantes, setLoadingIntegrantes] = useState(false);

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
      setBrigadaData({ jefeBrigada: null, auxiliarTecnicos: [null], botanicos: [null], coinvestigadores: [null] });
      // limpiar integrantes anteriores
      setIntegrantesByRole({});
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
        const inicio = selectedConglomerado.fechaInicio || '';
        const fin = selectedConglomerado.fechaFinAprox || '';

        // Los roles deben llamarse exactamente: jefeBrigada, botanico, auxiliar, coinvestigador
        // Los roles deben llamarse exactamente: jefeBrigada, botanico, auxiliar, coinvestigador
        const rolesToFetch = ['auxiliar', 'botanico', 'jefeBrigada', 'coinvestigador'];
        const results: Record<string, Integrante[]> = {};
        try {
          // Ahora el endpoint devuelve todos los integrantes para la región/fechas.
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
  }, [dialogType, selectedConglomerado]);

  // Helpers para manejar arrays dinámicos en brigadaData
  const addArrayItem = (field: 'auxiliarTecnicos' | 'botanicos' | 'coinvestigadores') => {
    setBrigadaData(prev => ({ ...(prev as any), [field]: [...(prev as any)[field], null] }));
  };

  const removeArrayItem = (field: 'auxiliarTecnicos' | 'botanicos' | 'coinvestigadores', index: number) => {
    setBrigadaData(prev => {
      const arr = [...(prev as any)[field]];
      if (arr.length <= 1) return prev; // mantener al menos 1 campo vacío
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

  const handleAssign = () => {
    if (!selectedConglomerado) return;
    // Validación mínima
    if (!brigadaData.jefeBrigada) {
      alert('Seleccione el jefe de brigada');
      return;
    }

    // Actualizar estado y dejar un resumen en observaciones (simulación local)
    setConglomerados(prev => prev.map(c => c.id === selectedConglomerado.id ? ({
      ...c,
      estado: 'asignado',
      observaciones: `Jefe: ${brigadaData.jefeBrigada?.nombreCompleto || brigadaData.jefeBrigada?.nombre || 'N/A'}; Auxiliares: ${brigadaData.auxiliarTecnicos.filter(Boolean).map(x => x?.nombreCompleto || x?.nombre).join(', ') || 'N/A'}; Botánicos: ${brigadaData.botanicos.filter(Boolean).map(x => x?.nombreCompleto || x?.nombre).join(', ') || 'N/A'}`
    }) : c));

    handleCloseDialog();
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

    // Actualizar conglomerado con las fechas
    setConglomerados(prev => prev.map(c => c.id === selectedConglomerado.id ? ({ ...c, fechaInicio: inicio, fechaFinAprox: fin || '' }) : c));

    // También actualizar el objeto seleccionado para que los efectos que dependen
    // de `selectedConglomerado` (por ejemplo, la carga de integrantes) reciban las fechas
    setSelectedConglomerado(prev => prev ? ({ ...prev, fechaInicio: inicio || '', fechaFinAprox: fin || '' }) : prev);

    // Cambiar al diálogo de asignación (sin cerrar)
    setDialogType('assign');
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
      if (!it) return false;
      if (!it.id) return false;
      if (!current) return !selected.has(it.id);
      // permitir que el valor actual esté presente incluso si está en selected
      if (current && current.id === it.id) return true;
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
            {dialogType === 'edit' && `Editar Conglomerado ${selectedConglomerado?.id}`}
            {dialogType === 'delete' && 'Eliminar Conglomerado'}
            {dialogType === 'assign' && `Asignar Brigada a ${selectedConglomerado?.id}`}
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
                      sx={{ mb: 2 }}
                    />

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
                            onClick={() => {
                              // En modo edición dejamos que el usuario guarde manualmente
                              // No se calcula automáticamente la fecha fin.
                            }}
                          >
                            Siguiente
                          </Button>
                    </Box>
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
                      sx={{ mb: 2 }}
                    />

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
                            onClick={handleSaveDates}
                          >
                            Siguiente
                          </Button>
                    </Box>
                  </Box>
                )}
                {dialogType === 'assign' && (
                  <Box sx={{ mt: 2 }}>
                    {/* Jefe de brigada: select si hay resultados, fallback a texto */}
                    {/* Jefe de brigada: Autocomplete de selección única */}
                    {integrantesByRole['jefeBrigada'] && integrantesByRole['jefeBrigada'].length > 0 ? (
                      <Autocomplete
                        options={integrantesByRole['jefeBrigada']}
                        getOptionLabel={(o: any) => o.nombreCompleto || o.nombre}
                        value={brigadaData.jefeBrigada}
                        onChange={(_, v) => setBrigadaData(prev => ({ ...prev, jefeBrigada: v }))}
                        isOptionEqualToValue={(option, value) => option?.id === value?.id}
                        renderInput={renderWithLoading('Jefe de Brigada')}
                      />
                    ) : (
                      <TextField
                        fullWidth
                        label="Jefe de Brigada"
                        value={brigadaData.jefeBrigada ? (brigadaData.jefeBrigada.nombreCompleto || brigadaData.jefeBrigada.nombre) : ''}
                        onChange={(e) => setBrigadaData(prev => ({ ...prev, jefeBrigada: { id: -1, nombreCompleto: e.target.value } }))}
                        sx={{ mb: 2 }}
                      />
                    )}

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Auxiliares Técnicos</Typography>
                      {brigadaData.auxiliarTecnicos.map((a, idx) => (
                        <Box key={`aux-${idx}`} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          {integrantesByRole['auxiliar'] && integrantesByRole['auxiliar'].length > 0 ? (
                            <Autocomplete
                              options={optionsFor('auxiliar', brigadaData.auxiliarTecnicos[idx])}
                              getOptionLabel={(o: any) => o.nombreCompleto || o.nombre}
                              value={brigadaData.auxiliarTecnicos[idx]}
                              onChange={(_, v) => updateArrayItem('auxiliarTecnicos', idx, v)}
                              isOptionEqualToValue={(option, value) => option?.id === value?.id}
                              renderInput={renderWithLoading(`Auxiliar ${idx + 1}`)}
                              fullWidth
                            />
                          ) : (
                            <TextField
                              fullWidth
                              value={a ? (a.nombreCompleto || a.nombre) : ''}
                              onChange={(e) => updateArrayItem('auxiliarTecnicos', idx, { id: -1, nombreCompleto: e.target.value })}
                              placeholder={`Auxiliar ${idx + 1}`}
                            />
                          )}
                          <Button size="small" variant="outlined" onClick={() => removeArrayItem('auxiliarTecnicos', idx)}>-</Button>
                        </Box>
                      ))}
                      <Button size="small" onClick={() => addArrayItem('auxiliarTecnicos')}>Agregar Auxiliar</Button>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Botánicos</Typography>
                      {brigadaData.botanicos.map((b, idx) => (
                        <Box key={`bot-${idx}`} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          {integrantesByRole['botanico'] && integrantesByRole['botanico'].length > 0 ? (
                            <Autocomplete
                              options={optionsFor('botanico', brigadaData.botanicos[idx])}
                              getOptionLabel={(o: any) => o.nombreCompleto || o.nombre}
                              value={brigadaData.botanicos[idx]}
                              onChange={(_, v) => updateArrayItem('botanicos', idx, v)}
                              isOptionEqualToValue={(option, value) => option?.id === value?.id}
                              renderInput={renderWithLoading(`Botánico ${idx + 1}`)}
                              fullWidth
                            />
                          ) : (
                            <TextField
                              fullWidth
                              value={b ? (b.nombreCompleto || b.nombre) : ''}
                              onChange={(e) => updateArrayItem('botanicos', idx, { id: -1, nombreCompleto: e.target.value })}
                              placeholder={`Botánico ${idx + 1}`}
                            />
                          )}
                          <Button size="small" variant="outlined" onClick={() => removeArrayItem('botanicos', idx)}>-</Button>
                        </Box>
                      ))}
                      <Button size="small" onClick={() => addArrayItem('botanicos')}>Agregar Botánico</Button>
                    </Box>

                    <Box sx={{ mb: 1 }}>
                      <Typography variant="body2" sx={{ mb: 1 }}>Coinvestigadores</Typography>
                      {brigadaData.coinvestigadores.map((c, idx) => (
                        <Box key={`ci-${idx}`} sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          {integrantesByRole['coinvestigador'] && integrantesByRole['coinvestigador'].length > 0 ? (
                            <Autocomplete
                              options={optionsFor('coinvestigador', brigadaData.coinvestigadores[idx])}
                              getOptionLabel={(o: any) => o.nombreCompleto || o.nombre}
                              value={brigadaData.coinvestigadores[idx]}
                              onChange={(_, v) => updateArrayItem('coinvestigadores', idx, v)}
                              isOptionEqualToValue={(option, value) => option?.id === value?.id}
                              renderInput={renderWithLoading(`Coinvestigador ${idx + 1}`)}
                              fullWidth
                            />
                          ) : (
                            <TextField
                              fullWidth
                              value={c ? (c.nombreCompleto || c.nombre) : ''}
                              onChange={(e) => updateArrayItem('coinvestigadores', idx, { id: -1, nombreCompleto: e.target.value })}
                              placeholder={`Coinvestigador ${idx + 1}`}
                            />
                          )}
                          <Button size="small" variant="outlined" onClick={() => removeArrayItem('coinvestigadores', idx)}>-</Button>
                        </Box>
                      ))}
                      <Button size="small" onClick={() => addArrayItem('coinvestigadores')}>Agregar Coinvestigador</Button>
                    </Box>
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
              {dialogType === 'assignDates' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
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
                  Guardar Fechas
                </Button>
              )}
              {dialogType === 'assign' && (
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<SaveIcon />}
                  onClick={handleAssign}
                  disabled={(
                    !(brigadaData.jefeBrigada && brigadaData.jefeBrigada.id && brigadaData.jefeBrigada.id !== -1) ||
                    brigadaData.auxiliarTecnicos.filter(a => a && a.id && a.id !== -1).length < 1 ||
                    brigadaData.botanicos.filter(b => b && b.id && b.id !== -1).length < 1
                  )}
                >
                  Asignar Brigada
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