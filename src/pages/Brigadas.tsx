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
  Paper
} from '@mui/material';
import { listarBrigadas, RawBrigadaResponse } from '../services/core';

interface BrigadaIntegrante {
  integrante_id: number;
  rol_asignado: string;
  nombre_completo?: string;
}

interface Brigada {
  id: number;
  fechaCreacion: string;
  estado: string;
  fechaInicio: string;
  fechaFinAprox: string;
  integrantes: BrigadaIntegrante[];
  conglomeradoNombre?: string;
}

type EstadoChipColor = 'default' | 'primary' | 'success' | 'warning' | 'error';

const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/>
  </svg>
);

const formatBrigadaId = (id: number) => `BRG-${String(id).padStart(3, '0')}`;

const formatFecha = (fecha: string) => {
  if (!fecha) return 'N/A';
  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return fecha;
  return parsed.toLocaleDateString('es-CO');
};

const formatRol = (rol: string) => {
  if (!rol) return 'Sin rol';
  return rol
    .toLowerCase()
    .split('_')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
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

const displayNombreIntegrante = (integrante: BrigadaIntegrante) => {
  if (integrante.nombre_completo && integrante.nombre_completo.trim()) {
    return integrante.nombre_completo;
  }
  return `Integrante ${integrante.integrante_id}`;
};

const GestionarBrigadas: React.FC = () => {
  const [brigadas, setBrigadas] = useState<Brigada[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const cargarBrigadas = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('access_token') || '';
        const datos = await listarBrigadas(token);
        const mapped: Brigada[] = datos.map((brigada: RawBrigadaResponse) => ({
          id: brigada.id,
          fechaCreacion: brigada.fechaCreacion ?? '',
          estado: brigada.estado ?? 'Desconocido',
          fechaInicio: brigada.fechaInicio ?? '',
          fechaFinAprox: brigada.fechaFinAprox ?? '',
          integrantes: (brigada.integrantes ?? []).map((integrante) => ({
            integrante_id: integrante.integrante_id,
            rol_asignado: integrante.rol_asignado,
            nombre_completo: integrante.nombre_completo
          })),
          conglomeradoNombre: brigada.conglomerado_info?.nombre
        }));
        setBrigadas(mapped);
      } catch (err) {
        console.error('Error cargando brigadas:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    cargarBrigadas();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredBrigadas = useMemo(() => {
    if (!normalizedSearch) return brigadas;
    return brigadas.filter((brigada) => {
      const idMatch = formatBrigadaId(brigada.id).toLowerCase().includes(normalizedSearch);
      const estadoMatch = brigada.estado.toLowerCase().includes(normalizedSearch);
      const conglomeradoMatch = brigada.conglomeradoNombre?.toLowerCase().includes(normalizedSearch) ?? false;
      const integrantesMatch = brigada.integrantes.some((integrante) => {
        const nombre = displayNombreIntegrante(integrante).toLowerCase();
        const rol = formatRol(integrante.rol_asignado).toLowerCase();
        return nombre.includes(normalizedSearch) || rol.includes(normalizedSearch);
      });
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
                      {formatBrigadaId(brigada.id)}
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
                        Integrantes ({brigada.integrantes.length})
                      </Typography>
                      {brigada.integrantes.length === 0 ? (
                        <Typography variant="body2" color="textSecondary">
                          No hay integrantes asociados
                        </Typography>
                      ) : (
                        brigada.integrantes.map((integrante) => (
                          <Typography key={`${brigada.id}-${integrante.integrante_id}`} variant="body2" sx={{ pl: 1 }}>
                            <strong>{formatRol(integrante.rol_asignado)}:</strong> {displayNombreIntegrante(integrante)}
                          </Typography>
                        ))
                      )}
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
      </Container>
    </Box>
  );
};

export default GestionarBrigadas;