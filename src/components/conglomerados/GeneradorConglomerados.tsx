import React, { useState } from 'react';
import MapaColombia from './MapaColombia';
import { guardarConglomerado } from '../../services/core';
import { Box, Button, Card, Container, TextField, Typography, Alert, Table, TableBody, TableCell, TableHead, TableRow, TableContainer, TablePagination, CircularProgress } from '@mui/material';
import { verificarCoordenadasEnColombia } from '../../services/core';
import { getCookie } from '../../utils/cookies';
import { useNotification } from '../../context/NotificationContext';

  const MAX_CONGLOMERADOS = 20;

  const generarCoordenadaAleatoria = (): [number, number] => {
    // Colombia continental aproximada
    const latitud = parseFloat((Math.random() * (13.5 - 1.8) + 1.8).toFixed(6));
    const longitud = parseFloat((Math.random() * (-66 - -79) + -79).toFixed(6));
    return [latitud, longitud];
  };

  interface ConglomeradoVerificado {
    lat: number;
    lon: number;
    departamento: string;
    municipio: string;
    region: string;
  }

  const GeneradorConglomerados: React.FC = () => {
    const { showNotification } = useNotification();
    const [cantidad, setCantidad] = useState('');
    const [conglomerados, setConglomerados] = useState<ConglomeradoVerificado[]>([]);
    const [cargando, setCargando] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setCantidad(e.target.value);
    };

    const generarCoordenadasAleatorias = async () => {
      if (cantidad === '') { showNotification('❌ Ingresa la cantidad', 'warning'); return; }
      const cantidadNumerica = parseInt(cantidad);
      if (cantidadNumerica <= 0) { showNotification('❌ Debe ser mayor a 0', 'warning'); return; }
      if (cantidadNumerica > MAX_CONGLOMERADOS) {
        showNotification(`❌ Máximo permitido: ${MAX_CONGLOMERADOS} conglomerados por tanda`, 'warning');
        return;
      }

      setCargando(true);
      const token = getCookie('access_token') || '';
      let verificados: ConglomeradoVerificado[] = [];
      let intentos = 0;
      while (verificados.length < cantidadNumerica && intentos < 20) {
        const faltantes = cantidadNumerica - verificados.length;
        const coordenadasGeneradas: { latitud: number; longitud: number }[] = Array.from({ length: faltantes }, () => {
          const latitud = parseFloat((Math.random() * (13.4 - -4.3) + -4.3).toFixed(6));
          const longitud = parseFloat((Math.random() * (-66.8 - -81.8) + -81.8).toFixed(6));

          return { latitud, longitud };
        });
        try {
          const nuevos: ConglomeradoVerificado[] = await verificarCoordenadasEnColombia(coordenadasGeneradas, token);
          verificados = verificados.concat(nuevos);
        } catch (error) {
          showNotification('Error al verificar coordenadas en backend: ' + (error instanceof Error ? error.message : 'Error desconocido'), 'error');
          break;
        }
        intentos++;
      }
      setConglomerados(verificados.slice(0, cantidadNumerica));
      setCargando(false);
    };

    // Transformar conglomerados verificados a coordenadas para el mapa
    const coordenadasMapa = conglomerados.map((c, idx) => ({
      id: idx + 1,
      latitud: c.lat,
      longitud: c.lon,
      region: c.region,
      departamento: c.departamento,
      municipio: c.municipio
    }));

    return (
      <Box
        sx={{
          backgroundImage: 'url(/images/fondo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '100vh',
          py: 3
        }}
      >
        <Container maxWidth="xl">
          <Card sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255,255,255,0.85)' }}>
            <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              GENERAR CONGLOMERADOS
            </Typography>
            <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
              sistema de generación aleatoria de coordenadas para conglomerados
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
              <Box sx={{ flex: { lg: 7 } }}>
                <MapaColombia conglomerados={coordenadasMapa} />
              </Box>

              <Box sx={{ flex: { lg: 3 }, minWidth: { lg: '350px' }, mt: 4 }}>
                <Card sx={{ p: 3, backgroundColor: '#f8f9fa', border: '2px solid #2E7D32', height: 'fit-content' }}>
                  <TextField
                    fullWidth
                    label="Cantidad de conglomerados"
                    type="text"
                    value={cantidad}
                    onChange={handleCantidadChange}
                    placeholder="Ej: 5, 10..."
                    variant="outlined"
                    size="small"
                    sx={{ mb: 2 }}
                  />
                  <Button
                    variant="contained"
                    size="large"
                    onClick={generarCoordenadasAleatorias}
                    disabled={cargando}
                    sx={{
                      backgroundColor: '#2E7D32',
                      '&:hover': { backgroundColor: '#1B5E20' },
                      width: '100%',
                      '&:disabled': { backgroundColor: '#cccccc' }
                    }}
                  >
                    {cargando ? <CircularProgress size={24} /> : 'GENERAR CONGLOMERADOS'}
                  </Button>
                </Card>
              </Box>
            </Box>

            {/* Tabla de conglomerados verificados */}
            <Card sx={{ p: 2 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Latitud</TableCell>
                      <TableCell>Longitud</TableCell>
                      <TableCell>Municipio</TableCell>
                      <TableCell>Departamento</TableCell>
                      <TableCell>Región</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {conglomerados.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c, index) => (
                      <TableRow key={index}>
                        <TableCell>{c.lat}</TableCell>
                        <TableCell>{c.lon}</TableCell>
                          <TableCell>{c.municipio}</TableCell>
                          <TableCell>{c.departamento}</TableCell>
                          <TableCell>{c.region}</TableCell>
                          <TableCell>
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              sx={{ mr: 1 }}
                              onClick={async () => {
                                const token = getCookie('access_token') || '';
                                try {
                                  await guardarConglomerado(c, token);
                                  showNotification(`Conglomerado ${c.municipio} guardado en BD`, 'success');
                                  setConglomerados(prev => prev.filter((_, i) => i !== index));
                                } catch (error) {
                                  showNotification('Error al guardar conglomerado: ' + (error instanceof Error ? error.message : 'Error desconocido'), 'error');
                                }
                              }}
                            >
                              Guardar
                            </Button>
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => {
                                // Elimina el conglomerado de la lista usando el índice
                                setConglomerados(prev => prev.filter((_, i) => i !== index));
                              }}
                            >
                              Eliminar
                            </Button>
                          </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              <TablePagination
                component="div"
                count={conglomerados.length}
                page={page}
                onPageChange={(event, newPage) => setPage(newPage)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(event) => {
                  setRowsPerPage(parseInt(event.target.value, 10));
                  setPage(0);
                }}
                rowsPerPageOptions={[5, 10, 25, 50]}
              />
            </Card>
          </Card>
        </Container>
      </Box>
    );
  };

  export default GeneradorConglomerados;