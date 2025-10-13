import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  Checkbox,
  Container,
  FormControlLabel,
  TextField,
  Typography,
  Paper,
  Alert,
  AppBar,
  Toolbar,
  Menu,
  MenuItem
} from '@mui/material';
import { Coordenada, ConglomeradoForm, zonasBosqueColombia, areasMaritimas } from '../../models/Conglomerado';
import TablaCoordenadas from './TablaCoordenadas';
import MapaColombia from './MapaColombia';

const GeneradorConglomerados: React.FC = () => {
  // Estado con string vacío para input limpio
  const [form, setForm] = useState<ConglomeradoForm>({
    cantidad: '',
    confirmado: false
  });
  
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Manejo del menú
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handler para el input - solo números y campo vacío
  const handleCantidadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    
    // Solo permitir números y campo vacío
    if (value === '' || /^\d+$/.test(value)) {
      setForm(prev => ({ ...prev, cantidad: value }));
    }
  };

  // Función de validación (la misma que en MapaColombia)
  const validarUbicacion = (lat: number, lng: number): {estaEnBosque: boolean, region: string} => {
    // Primero verificar si está en área marítima
    for (const area of areasMaritimas) {
      const { bounds, nombre } = area;
      if (lat >= bounds.lat[0] && lat <= bounds.lat[1] && 
          lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
        return { estaEnBosque: false, region: `Mar ${nombre}` };
      }
    }

    // Luego verificar si está en zona boscosa
    for (const zona of zonasBosqueColombia) {
      const { bounds, nombre } = zona;
      if (lat >= bounds.lat[0] && lat <= bounds.lat[1] && 
          lng >= bounds.lng[0] && lng <= bounds.lng[1]) {
        return { estaEnBosque: true, region: nombre };
      }
    }

    // Si no está en mar ni en bosque, es tierra pero no boscosa
    return { estaEnBosque: false, region: 'Tierra no boscosa' };
  };

  // Función OPTIMIZADA de generación aleatoria - 80% válidos, 20% inválidos
  const generarCoordenadasAleatorias = () => {
    // Validaciones
    if (form.cantidad === '') {
      alert('❌ Por favor ingresa la cantidad de conglomerados');
      return;
    }

    const cantidadNumerica = parseInt(form.cantidad);
    
    if (cantidadNumerica <= 0) {
      alert('❌ La cantidad debe ser mayor a 0');
      return;
    }

    if (cantidadNumerica > 100) {
      alert('❌ La cantidad máxima es 100 conglomerados');
      return;
    }

    if (!form.confirmado) {
      setMostrarAlerta(true);
      setTimeout(() => setMostrarAlerta(false), 3000);
      return;
    }

    // Lógica de generación OPTIMIZADA - 80% válidos, 20% inválidos
    const nuevasCoordenadas: Coordenada[] = [];
    
    for (let i = 0; i < cantidadNumerica; i++) {
      let latitud, longitud;
      
      // 80% de probabilidad de generar válido, 20% de inválido
      const generarValido = Math.random() < 0.8;
      
      if (generarValido) {
        // Generar en zona boscosa (80%)
        const zonaAleatoria = zonasBosqueColombia[
          Math.floor(Math.random() * zonasBosqueColombia.length)
        ];
        latitud = Math.random() * (zonaAleatoria.bounds.lat[1] - zonaAleatoria.bounds.lat[0]) + zonaAleatoria.bounds.lat[0];
        longitud = Math.random() * (zonaAleatoria.bounds.lng[1] - zonaAleatoria.bounds.lng[0]) + zonaAleatoria.bounds.lng[0];
      } else {
        // Generar inválido (20% - 10% mar, 10% tierra no boscosa)
        if (Math.random() > 0.5) {
          // Mar (10%)
          const areaMaritima = areasMaritimas[Math.floor(Math.random() * areasMaritimas.length)];
          latitud = Math.random() * (areaMaritima.bounds.lat[1] - areaMaritima.bounds.lat[0]) + areaMaritima.bounds.lat[0];
          longitud = Math.random() * (areaMaritima.bounds.lng[1] - areaMaritima.bounds.lng[0]) + areaMaritima.bounds.lng[0];
        } else {
          // Tierra no boscosa (10%)
          latitud = Math.random() * 10 + 1; // Entre 1°N y 11°N
          longitud = Math.random() * 8 + -76; // Entre -76° y -68°
        }
      }
      
      const validacionResultado = validarUbicacion(latitud, longitud);
      
      nuevasCoordenadas.push({
        id: Date.now() + i,
        latitud: parseFloat(latitud.toFixed(6)),
        longitud: parseFloat(longitud.toFixed(6)),
        region: validacionResultado.region,
        estaEnBosque: validacionResultado.estaEnBosque,
        fechaCreacion: new Date()
      });
    }

    // Contar estadísticas finales
    const validos = nuevasCoordenadas.filter(c => c.estaEnBosque).length;
    const noValidos = nuevasCoordenadas.filter(c => !c.estaEnBosque).length;
    const enMar = nuevasCoordenadas.filter(c => c.region.includes('Mar')).length;
    const enTierraNoBoscosa = noValidos - enMar;
    
    const porcentajeValidos = ((validos / cantidadNumerica) * 100).toFixed(1);
    
    alert(`📊 Generación completada:\n\n` +
          `✅ Conglomerados válidos (bosque): ${validos} (${porcentajeValidos}%)\n` +
          `❌ Conglomerados no válidos: ${noValidos}\n` +
          `   └─ 🌊 En el mar: ${enMar}\n` +
          `   └─ 🏞️ En tierra no boscosa: ${enTierraNoBoscosa}\n\n` +
          `¡La mayoría de conglomerados están en zonas boscosas válidas! 🌳`);
    
    setCoordenadas(nuevasCoordenadas);
  };

  const handleConglomeradoCreado = (nuevoConglomerado: Coordenada) => {
    setCoordenadas(prev => [...prev, { ...nuevoConglomerado, id: Date.now() }]);
  };

  return (
    <Box>
      {/* BARRA DE NAVEGACIÓN SUPERIOR */}
      <AppBar 
        position="static" 
        sx={{ 
          backgroundColor: '#1B5E20',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 0,
              fontWeight: 'bold',
              mr: 4
            }}
          >
            🌳 INVENTARIO FORESTAL
          </Typography>

          <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
            <Button 
              color="inherit"
              sx={{ 
                mx: 1,
                fontWeight: 'bold',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
              onClick={() => alert('Funcionalidad de LOGIN - Para el video')}
            >
              LOGIN
            </Button>
            
            <Button 
              color="inherit"
              sx={{ 
                mx: 1,
                fontWeight: 'bold',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
              onClick={() => alert('Funcionalidad de ESPECIES - Para el video')}
            >
              ESPECIES
            </Button>
            
            <Button 
              color="inherit"
              sx={{ 
                mx: 1,
                fontWeight: 'bold',
                backgroundColor: 'rgba(255,255,255,0.2)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              MAPA
            </Button>
            
            <Button 
              color="inherit"
              sx={{ 
                mx: 1,
                fontWeight: 'bold',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
              onClick={() => alert('Funcionalidad de REPORTES - Para el video')}
            >
              REPORTES
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body2" sx={{ mr: 2 }}>
              Usuario: Investigador
            </Typography>
            <Button 
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ 
                border: '1px solid rgba(255,255,255,0.3)',
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' }
              }}
            >
              Menú ▾
            </Button>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={handleMenuClose}>Mi Perfil</MenuItem>
              <MenuItem onClick={handleMenuClose}>Configuración</MenuItem>
              <MenuItem onClick={handleMenuClose}>Cerrar Sesión</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>

      {/* CONTENIDO PRINCIPAL */}
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {mostrarAlerta && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Debe confirmar la generación de coordenadas aleatorias
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3 }}>
          <Typography 
            variant="h4" 
            component="h1" 
            gutterBottom 
            align="center"
            sx={{ 
              fontWeight: 'bold',
              color: '#2E7D32',
              mb: 2
            }}
          >
            Crear Conglomerados
          </Typography>

          <Typography 
            variant="h6" 
            component="h2" 
            gutterBottom 
            align="center"
            sx={{ 
              color: '#455A64',
              mb: 3
            }}
          >
            Sistema de Gestión de Conglomerados Forestales - Colombia
          </Typography>

          {/* Layout Principal */}
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
            
            {/* Mapa */}
            <Box sx={{ flex: { lg: 7 } }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Mapa Interactivo de Colombia
                </Typography>
                <Typography variant="body2" color="textSecondary" gutterBottom>
                  Haz clic en CUALQUIER parte del mapa para crear conglomerados. El sistema detectará automáticamente si están en bosque, mar o tierra no boscosa.
                </Typography>
              </Box>
              
              <MapaColombia 
                onConglomeradoCreado={handleConglomeradoCreado}
                conglomerados={coordenadas}
              />
            </Box>

            {/* Formulario de Generación Aleatoria */}
            <Box sx={{ 
              flex: { lg: 3 }, 
              minWidth: { lg: '350px' },
              mt: 4
            }}>
              <Card 
                sx={{ 
                  p: 3, 
                  backgroundColor: '#f8f9fa',
                  border: '2px solid #2E7D32',
                  height: 'fit-content'
                }}
              >
                <Typography variant="h6" gutterBottom sx={{ color: '#2E7D32', textAlign: 'center' }}>
                  Generación Aleatoria
                </Typography>
                
                <Typography variant="body2" color="textSecondary" sx={{ mb: 3, textAlign: 'center' }}>
                  Genera conglomerados automáticamente (80% en zonas boscosas, 20% para demostración)
                </Typography>
                
                {/* Campo de cantidad - LIMPIO */}
                <TextField
                  fullWidth
                  label="Cantidad de conglomerados:"
                  type="text"
                  value={form.cantidad}
                  onChange={handleCantidadChange}
                  placeholder="Ej: 5, 10, 20..."
                  variant="outlined"
                  size="small"
                  sx={{ mb: 2 }}
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.confirmado}
                      onChange={(e) => setForm(prev => ({ ...prev, confirmado: e.target.checked }))}
                      sx={{ color: '#2E7D32', '&.Mui-checked': { color: '#2E7D32' } }}
                    />
                  }
                  label="Confirmar generación de coordenadas aleatorias"
                  sx={{ mb: 3, display: 'block' }}
                />
                
                <Button
                  variant="contained"
                  size="large"
                  onClick={generarCoordenadasAleatorias}
                  disabled={form.cantidad === '' || !form.confirmado}
                  sx={{
                    backgroundColor: '#2E7D32',
                    '&:hover': { backgroundColor: '#1B5E20' },
                    px: 4,
                    py: 1.5,
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    width: '100%'
                  }}
                >
                  GENERAR CONGLOMERADOS
                </Button>

                {/* Estadísticas detalladas */}
                <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Resumen Detallado:
                  </Typography>
                  <Typography variant="body2">
                    • Total: <strong>{coordenadas.length}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'green' }}>
                    • Válidos (bosque): <strong>{coordenadas.filter(c => c.estaEnBosque).length}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'red' }}>
                    • No válidos: <strong>{coordenadas.filter(c => !c.estaEnBosque).length}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'blue', fontSize: '0.8rem', ml: 2 }}>
                    └─ 🌊 En mar: {coordenadas.filter(c => c.region.includes('Mar')).length}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'orange', fontSize: '0.8rem', ml: 2 }}>
                    └─ 🏞️ Tierra no boscosa: {coordenadas.filter(c => !c.estaEnBosque && !c.region.includes('Mar')).length}
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Tabla de Conglomerados */}
          <Box sx={{ mt: 3 }}>
            <Card sx={{ p: 2 }}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Conglomerados Creados: {coordenadas.length}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Lista completa de todos los conglomerados generados
                </Typography>
              </Box>
              
              {coordenadas.length > 0 ? (
                <Box sx={{ maxHeight: '400px', overflow: 'auto' }}>
                  <TablaCoordenadas coordenadas={coordenadas} />
                </Box>
              ) : (
                <Paper 
                  sx={{ 
                    p: 4, 
                    textAlign: 'center', 
                    backgroundColor: '#fafafa',
                    border: '2px dashed #e0e0e0'
                  }}
                >
                  <Typography color="textSecondary">
                    No hay conglomerados creados aún.
                    <br />
                    Usa el formulario de generación aleatoria o haz clic en el mapa.
                  </Typography>
                </Paper>
              )}
            </Card>
          </Box>

          {/* Leyenda actualizada */}
          <Box sx={{ mt: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
              Leyenda:
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: '#4CAF50', 
                  borderRadius: '50%',
                  opacity: 0.4,
                  border: '3px solid #2E7D32'
                }}></Box>
                <Typography variant="body2">
                  <strong>Círculo verde:</strong> Conglomerado VÁLIDO en zona boscosa
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ 
                  width: 20, 
                  height: 20, 
                  backgroundColor: '#f44336', 
                  borderRadius: '50%',
                  opacity: 0.3,
                  border: '2px dashed #c62828'
                }}></Box>
                <Typography variant="body2">
                  <strong>Círculo rojo:</strong> Conglomerado NO VÁLIDO (mar o tierra no boscosa)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ fontStyle: 'italic', color: '#2E7D32', mt: 1 }}>
                💡 <strong>Nota:</strong> La generación aleatoria prioriza zonas boscosas (80% válidos) para simular un escenario realista de inventario forestal.
              </Typography>
            </Box>
          </Box>
        </Card>

        {/* Footer */}
        <Paper sx={{ p: 3, textAlign: 'center', backgroundColor: '#f5f5f5', borderTop: '2px solid #2E7D32' }}>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            <strong>INVENTARIO FORESTAL NACIONAL - COLOMBIA</strong>
          </Typography>
          <Typography variant="body2" color="textSecondary">
            © 2025 INVENTARIO FORESTAL NACIONAL - TODOS LOS DERECHOS RESERVADOS 
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default GeneradorConglomerados;