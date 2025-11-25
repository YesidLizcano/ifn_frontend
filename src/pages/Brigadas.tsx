import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  Container,
  Typography,
  Chip,
  TextField,
  InputAdornment,
  Alert,
  CircularProgress,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from '@mui/material';
import { 
  listarBrigadas, 
  RawBrigadaResponse, 
  listarIntegrantesBrigada, 
  BrigadaIntegranteDetalle, 
  eliminarIntegranteBrigada,
  listarConglomerados,
  listarIntegrantesPorRegion,
  agregarIntegranteBrigada,
  Integrante,
  RawConglomeradoResponse
} from '../services/core';

interface Brigada {
  id: number;
  fechaCreacion: string;
  estado: string;
  fechaInicio: string;
  fechaFinAprox: string;
  integrantes: string;
  conglomeradoNombre?: string;
  conglomerado_id?: number;
  municipio?: string;
}

type EstadoChipColor = 'default' | 'primary' | 'success' | 'warning' | 'error';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const PeopleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
  </svg>
);

const DeleteIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
  </svg>
);

const ReplaceIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 6v3l4-4-4-4v3c-4.42 0-8 3.58-8 8 0 1.57.46 3.03 1.24 4.26L6.7 14.8c-.45-.83-.7-1.79-.7-2.8 0-3.31 2.69-6 6-6zm6.76 1.74L17.3 9.2c.44.84.7 1.79.7 2.8 0 3.31-2.69 6-6 6v-3l-4 4 4 4v-3c4.42 0 8-3.58 8-8 0-1.57-.46-3.03-1.24-4.26z"/>
  </svg>
);

const formatBrigadaId = (municipio: string) => `BRG-${municipio}`;

const formatFecha = (fecha: string) => {
  if (!fecha) return 'N/A';
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return fecha;
  return parsed.toLocaleDateString('es-CO');
};

const getEstadoChipColor = (estado: string): EstadoChipColor => {
  switch (estado.toLowerCase()) {
    case 'activa':
      return 'success';
    case 'asignada':
    case 'asignado':
      return 'primary';
    case 'inactiva':
    case 'suspendida':
      return 'warning';
    case 'cancelada':
      return 'error';
    default:
      return 'default';
  }
};

const getEstadoBorderColor = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'activa':
      return '#4CAF50';
    case 'asignada':
    case 'asignado':
      return '#2196F3';
    case 'inactiva':
    case 'suspendida':
      return '#FF9800';
    case 'cancelada':
      return '#F44336';
    default:
      return 'rgba(0,0,0,0.12)';
  }
};

const getMemberRole = (member: Integrante): string => {
  if (member.rol) return member.rol;
  if (member.jefeBrigada) return 'JEFE_BRIGADA';
  if (member.botanico) return 'BOTANICO';
  if (member.auxiliar) return 'AUXILIAR';
  if (member.coinvestigador) return 'COINVESTIGADOR';
  return 'SIN_ROL';
};

const generateIntegrantesSummary = (members: BrigadaIntegranteDetalle[]): string => {
  const count = members.length;
  const roles: Record<string, number> = {
    'JEFE_BRIGADA': 0,
    'BOTANICO': 0,
    'AUXILIAR': 0,
    'COINVESTIGADOR': 0
  };
  
  members.forEach(m => {
    if (roles[m.rol] !== undefined) roles[m.rol]++;
  });

  const parts = [`Integrantes (${count})`];
  
  if (roles['JEFE_BRIGADA'] > 0) parts.push(`${roles['JEFE_BRIGADA']} Jefe${roles['JEFE_BRIGADA'] > 1 ? 's' : ''}`);
  if (roles['BOTANICO'] > 0) parts.push(`${roles['BOTANICO']} Botánico${roles['BOTANICO'] > 1 ? 's' : ''}`);
  if (roles['AUXILIAR'] > 0) parts.push(`${roles['AUXILIAR']} Auxiliar${roles['AUXILIAR'] > 1 ? 'es' : ''}`);
  if (roles['COINVESTIGADOR'] > 0) parts.push(`${roles['COINVESTIGADOR']} Coinvestigador${roles['COINVESTIGADOR'] > 1 ? 'es' : ''}`);

  return parts.join(' | ');
};

const GestionarBrigadas: React.FC = () => {
  const [brigadas, setBrigadas] = useState<Brigada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [membersDialogOpen, setMembersDialogOpen] = useState(false);
  const [selectedBrigadaMembers, setSelectedBrigadaMembers] = useState<BrigadaIntegranteDetalle[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedBrigadaIdForDialog, setSelectedBrigadaIdForDialog] = useState<number | null>(null);
  
  // Nuevos estados para agregar integrantes
  const [conglomerados, setConglomerados] = useState<RawConglomeradoResponse[]>([]);
  const [availableMembers, setAvailableMembers] = useState<Integrante[]>([]);
  const [showAddMember, setShowAddMember] = useState(false);
  const [memberToReplace, setMemberToReplace] = useState<BrigadaIntegranteDetalle | null>(null);

  useEffect(() => {
    const cargarDatos = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token') || '';
        
        // Cargar brigadas y conglomerados en paralelo
        const [brigadasData, conglomeradosData] = await Promise.all([
          listarBrigadas(token),
          listarConglomerados(token)
        ]);

        setConglomerados(conglomeradosData);

        const mapped: Brigada[] = brigadasData.map((brigada: RawBrigadaResponse) => ({
          id: brigada.id,
          fechaCreacion: brigada.fechaCreacion ?? '',
          estado: brigada.estado ?? 'Desconocido',
          fechaInicio: brigada.fechaInicio ?? '',
          fechaFinAprox: brigada.fechaFinAprox ?? '',
          integrantes: brigada.integrantes || 'Sin información',
          conglomerado_id: brigada.conglomerado_id,
          conglomeradoNombre: `Conglomerado ${brigada.municipio}`,
          municipio: brigada.municipio
        }));
        setBrigadas(mapped);
      } catch (err) {
        console.error('Error cargando datos:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    cargarDatos();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBrigadas = useMemo(() => {
    if (!normalizedSearch) return brigadas;
    return brigadas.filter((brigada) => {
      const idMatch = formatBrigadaId(brigada.municipio || '').toLowerCase().includes(normalizedSearch);
      const estadoMatch = brigada.estado.toLowerCase().includes(normalizedSearch);
      const conglomeradoMatch = brigada.conglomeradoNombre?.toLowerCase().includes(normalizedSearch) ?? false;
      const integrantesMatch = brigada.integrantes.toLowerCase().includes(normalizedSearch);
      return idMatch || estadoMatch || conglomeradoMatch || integrantesMatch;
    });
  }, [brigadas, normalizedSearch]);

  const estadoResumen = useMemo(() => {
    const resumen = new Map<string, number>();
    brigadas.forEach((brigada) => {
      const key = brigada.estado || 'Desconocido';
      resumen.set(key, (resumen.get(key) ?? 0) + 1);
    });
    return resumen;
  }, [brigadas]);

  const handleViewMembers = async (brigadaId: number, municipio: string) => {
    setSelectedBrigadaIdForDialog(brigadaId);
    setLoadingMembers(true);
    setMembersDialogOpen(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const members = await listarIntegrantesBrigada(brigadaId, token);
      setSelectedBrigadaMembers(members);
    } catch (error) {
      console.error('Error loading members:', error);
      alert('Error al cargar los integrantes de la brigada');
      setMembersDialogOpen(false);
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleCloseMembersDialog = () => {
    setMembersDialogOpen(false);
    setSelectedBrigadaMembers([]);
    setSelectedBrigadaIdForDialog(null);
    setShowAddMember(false);
    setAvailableMembers([]);
    setMemberToReplace(null);
  };

  const handleDeleteMember = async (integranteId: number) => {
    if (!selectedBrigadaIdForDialog) return;

    const memberToDelete = selectedBrigadaMembers.find(m => m.id_integrante === integranteId);
    if (memberToDelete) {
      const roleCounts = selectedBrigadaMembers.reduce((acc, curr) => {
        acc[curr.rol] = (acc[curr.rol] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const MINIMUMS: Record<string, number> = {
        'JEFE_BRIGADA': 1,
        'BOTANICO': 1,
        'AUXILIAR': 1,
        'COINVESTIGADOR': 2
      };

      const role = memberToDelete.rol;
      if (roleCounts[role] <= (MINIMUMS[role] || 0)) {
        alert(`No se puede eliminar. La brigada requiere mínimo ${MINIMUMS[role]} ${role.replace('_', ' ')}.`);
        return;
      }
    }

    if (!window.confirm('¿Está seguro que desea eliminar este integrante de la brigada?')) return;

    try {
      const token = localStorage.getItem('access_token') || '';
      await eliminarIntegranteBrigada(selectedBrigadaIdForDialog, integranteId, token);
      
      // Actualizar la lista de integrantes localmente
      const newMembers = selectedBrigadaMembers.filter(m => m.id_integrante !== integranteId);
      setSelectedBrigadaMembers(newMembers);

      // Actualizar el resumen en la lista de brigadas
      const newSummary = generateIntegrantesSummary(newMembers);
      setBrigadas(prev => prev.map(b => b.id === selectedBrigadaIdForDialog ? { ...b, integrantes: newSummary } : b));

      alert('Integrante eliminado con éxito');
    } catch (error) {
      console.error('Error deleting member:', error);
      const msg = error instanceof Error ? error.message : 'Error desconocido';
      alert(`Error al eliminar integrante: ${msg}`);
    }
  };

  const handleLoadAvailableMembers = async () => {
    if (!selectedBrigadaIdForDialog) return;
    const brigada = brigadas.find(b => b.id === selectedBrigadaIdForDialog);
    if (!brigada) return;

    const conglomerado = conglomerados.find(c => c.id === brigada.conglomerado_id);
    
    if (!conglomerado) {
      // Fallback: try to use municipio if department not found, or alert
      // But listarIntegrantesPorRegion expects department.
      // Maybe we can try to guess or just alert.
      alert('No se encontró información del conglomerado para determinar la región (departamento).');
      return;
    }

    setLoadingMembers(true);
    try {
      const token = localStorage.getItem('access_token') || '';
      const members = await listarIntegrantesPorRegion(
        conglomerado.departamento_nombre,
        brigada.fechaInicio,
        brigada.fechaFinAprox,
        token
      );
      
      // Filter out members already in the brigade
      const currentMemberIds = new Set(selectedBrigadaMembers.map(m => m.id_integrante));
      const available = members.filter(m => !currentMemberIds.has(m.id));
      
      setAvailableMembers(available);
      setShowAddMember(true);
    } catch (error) {
      console.error('Error loading available members:', error);
      alert('Error al cargar integrantes disponibles');
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleAddMember = async (member: Integrante) => {
    if (!selectedBrigadaIdForDialog) return;
    const rol = getMemberRole(member);
    try {
      const token = localStorage.getItem('access_token') || '';
      await agregarIntegranteBrigada(selectedBrigadaIdForDialog, member.id, rol, token);
      
      alert('Integrante agregado con éxito');
      
      // Refresh members list
      const updatedMembers = await listarIntegrantesBrigada(selectedBrigadaIdForDialog, token);
      setSelectedBrigadaMembers(updatedMembers);

      // Actualizar el resumen en la lista de brigadas
      const newSummary = generateIntegrantesSummary(updatedMembers);
      setBrigadas(prev => prev.map(b => b.id === selectedBrigadaIdForDialog ? { ...b, integrantes: newSummary } : b));
      
      // Remove from available list
      setAvailableMembers(prev => prev.filter(m => m.id !== member.id));
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Error al agregar integrante');
    }
  };

  const handleStartReplace = async (member: BrigadaIntegranteDetalle) => {
    if (!selectedBrigadaIdForDialog) return;
    const brigada = brigadas.find(b => b.id === selectedBrigadaIdForDialog);
    if (!brigada) return;
    const conglomerado = conglomerados.find(c => c.id === brigada.conglomerado_id);
    if (!conglomerado) {
        alert('No se encontró información del conglomerado.');
        return;
    }

    setMemberToReplace(member);
    setLoadingMembers(true);
    try {
        const token = localStorage.getItem('access_token') || '';
        const members = await listarIntegrantesPorRegion(
            conglomerado.departamento_nombre,
            brigada.fechaInicio,
            brigada.fechaFinAprox,
            token
        );
        
        // Filter: same role, not currently in brigade
        const currentMemberIds = new Set(selectedBrigadaMembers.map(m => m.id_integrante));
        const available = members.filter(m => 
            !currentMemberIds.has(m.id) && 
            getMemberRole(m) === member.rol // Ensure same role
        );
        
        setAvailableMembers(available);
    } catch (error) {
        console.error('Error loading replacements:', error);
        alert('Error al cargar reemplazos disponibles');
        setMemberToReplace(null);
    } finally {
        setLoadingMembers(false);
    }
  };

  const handleReplaceMember = async (newMember: Integrante) => {
    if (!selectedBrigadaIdForDialog || !memberToReplace) return;
    
    if (!window.confirm(`¿Confirmar reemplazo de ${memberToReplace.nombreCompleto}?`)) return;

    const rol = getMemberRole(newMember);

    try {
        const token = localStorage.getItem('access_token') || '';
        
        // 1. Add new member
        await agregarIntegranteBrigada(selectedBrigadaIdForDialog, newMember.id, rol, token);
        
        // 2. Remove old member
        await eliminarIntegranteBrigada(selectedBrigadaIdForDialog, memberToReplace.id_integrante, token);
        
        alert('Reemplazo realizado con éxito');
        
        // Refresh
        const updatedMembers = await listarIntegrantesBrigada(selectedBrigadaIdForDialog, token);
        setSelectedBrigadaMembers(updatedMembers);

        // Actualizar el resumen en la lista de brigadas
        const newSummary = generateIntegrantesSummary(updatedMembers);
        setBrigadas(prev => prev.map(b => b.id === selectedBrigadaIdForDialog ? { ...b, integrantes: newSummary } : b));
        
        // Reset UI
        setMemberToReplace(null);
        setAvailableMembers([]);

    } catch (error) {
        console.error('Error replacing member:', error);
        alert('Error al realizar el reemplazo');
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
        <Card
          sx={{
            p: 3,
            backgroundColor: 'rgba(255,255,255,0.5)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.3)'
          }}
        >
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
              Consulte las brigadas registradas en el sistema y su estado actual
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <TextField
                placeholder="Buscar por ID, estado, integrante o rol..."
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
                  )
                }}
              />

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip label={`Total: ${brigadas.length}`} variant="outlined" color="primary" />
                {Array.from(estadoResumen.entries()).map(([estado, cantidad]) => (
                  <Chip
                    key={estado}
                    label={`${estado}: ${cantidad}`}
                    variant="outlined"
                    color={getEstadoChipColor(estado)}
                  />
                ))}
              </Box>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                Error al cargar brigadas: {error}
              </Alert>
            )}
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 3,
              justifyContent: { xs: 'center', md: 'flex-start' }
            }}
          >
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
                    border: `2px solid ${getEstadoBorderColor(brigada.estado)}`,
                    borderRadius: 2,
                    backgroundColor: 'rgba(255,255,255,0.95)',
                    display: 'flex',
                    flexDirection: 'column',
                    backdropFilter: 'blur(5px)'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
                      {formatBrigadaId(brigada.municipio || '')}
                    </Typography>
                    <Chip label={brigada.estado.toUpperCase()} color={getEstadoChipColor(brigada.estado)} size="small" />
                  </Box>

                  <Box sx={{ mb: 2, flex: 1 }}>
                    <Typography variant="body2" gutterBottom>
                      <strong>Fecha de creación:</strong> {formatFecha(brigada.fechaCreacion)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Fecha de inicio:</strong> {formatFecha(brigada.fechaInicio)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Fecha fin aprox.:</strong> {formatFecha(brigada.fechaFinAprox)}
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      <strong>Conglomerado:</strong> {brigada.conglomeradoNombre || 'Sin asignar'}
                    </Typography>

                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Integrantes
                      </Typography>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                        {brigada.integrantes}
                      </Typography>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<PeopleIcon />}
                        onClick={() => handleViewMembers(brigada.id, brigada.municipio || '')}
                        fullWidth
                      >
                        Ver Integrantes
                      </Button>
                    </Box>
                  </Box>
                </Paper>
              </Box>
            ))}
          </Box>

          {filteredBrigadas.length === 0 && !error && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No se encontraron brigadas que coincidan con la búsqueda
              </Typography>
            </Box>
          )}
        </Card>

        {/* Diálogo de Integrantes */}
        <Dialog
          open={membersDialogOpen}
          onClose={handleCloseMembersDialog}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              backgroundColor: 'rgba(255,255,255,0.95)',
              backdropFilter: 'blur(10px)'
            }
          }}
        >
          <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>
              {memberToReplace ? `Reemplazar a ${memberToReplace.nombreCompleto}` : 
               showAddMember ? 'Agregar Integrante a ' : 'Integrantes de la Brigada '} 
              {selectedBrigadaIdForDialog && !memberToReplace ? formatBrigadaId(brigadas.find(b => b.id === selectedBrigadaIdForDialog)?.municipio || '') : ''}
            </span>
            <Box>
              {!showAddMember && !memberToReplace && (
                <Button 
                  variant="contained" 
                  size="small" 
                  onClick={handleLoadAvailableMembers}
                  sx={{ mr: 1 }}
                >
                  Agregar Integrante
                </Button>
              )}
              {(showAddMember || memberToReplace) && (
                <Button 
                  variant="outlined" 
                  size="small" 
                  onClick={() => {
                    setShowAddMember(false);
                    setMemberToReplace(null);
                    setAvailableMembers([]);
                  }}
                >
                  Volver a Lista
                </Button>
              )}
            </Box>
          </DialogTitle>
          <DialogContent>
            {loadingMembers ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (showAddMember || memberToReplace) ? (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                      <TableCell><strong>Nombre</strong></TableCell>
                      <TableCell><strong>Rol</strong></TableCell>
                      <TableCell><strong>Acción</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {availableMembers.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell>{member.nombreCompleto || member.nombre}</TableCell>
                        <TableCell>{getMemberRole(member)}</TableCell>
                        <TableCell>
                          <Button 
                            size="small" 
                            variant="contained" 
                            color={memberToReplace ? "warning" : "primary"}
                            onClick={() => memberToReplace ? handleReplaceMember(member) : handleAddMember(member)}
                          >
                            {memberToReplace ? "Reemplazar" : "Agregar"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {availableMembers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={3} align="center">
                          {memberToReplace 
                            ? `No hay reemplazos disponibles para el rol ${memberToReplace.rol}.` 
                            : "No hay integrantes disponibles en esta región y fechas."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <TableContainer component={Paper} variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ backgroundColor: 'rgba(0,0,0,0.04)' }}>
                      <TableCell><strong>Rol</strong></TableCell>
                      <TableCell><strong>Nombre Completo</strong></TableCell>
                      <TableCell><strong>Teléfono</strong></TableCell>
                      <TableCell><strong>Email</strong></TableCell>
                      <TableCell><strong>Estado</strong></TableCell>
                      <TableCell><strong>Acciones</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {selectedBrigadaMembers.map((member) => (
                      <TableRow key={member.id_integrante}>
                        <TableCell>
                          <Chip 
                            label={member.rol.replace('_', ' ')} 
                            size="small" 
                            color={member.rol === 'JEFE_BRIGADA' ? 'primary' : 'default'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>{member.nombreCompleto}</TableCell>
                        <TableCell>{member.telefono}</TableCell>
                        <TableCell>{member.email}</TableCell>
                        <TableCell>
                          <Chip 
                            label={member.estado.replace('_', ' ')} 
                            size="small" 
                            color={member.estado === 'ACTIVO_DISPONIBLE' ? 'success' : 'default'}
                          />
                        </TableCell>
                        <TableCell>
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleStartReplace(member)}
                            title="Reemplazar integrante"
                            sx={{ mr: 1 }}
                          >
                            <ReplaceIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteMember(member.id_integrante)}
                            title="Eliminar integrante"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                    {selectedBrigadaMembers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} align="center">
                          No se encontraron detalles de integrantes.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseMembersDialog}>Cerrar</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default GestionarBrigadas;