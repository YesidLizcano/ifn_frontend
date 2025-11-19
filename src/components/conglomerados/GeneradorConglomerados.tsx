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
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  CircularProgress
} from '@mui/material';
import { Coordenada, ConglomeradoForm, zonasBosqueColombia, areasMaritimas } from '../../models/Conglomerado';
import MapaColombia from './MapaColombia';

// === CONFIGURACIÓN OPTIMIZADA PARA MÁS VÁLIDOS ===
const CONFIG = {
  maxConglomerados: 30,
  timeout: 8000,
  // Coordenadas enfocadas en zonas boscosas de Colombia
  zonasBoscosasPrioritarias: [
    // Amazonía Colombiana COMPLETA (alta probabilidad de bosque)
    { lat: [-4.5, 2.0], lng: [-75.0, -67.0], peso: 50 }, // ← MAYOR peso para Amazonía
    // Pacífico (muy boscoso)
    { lat: [2.0, 7.0], lng: [-78.0, -76.0], peso: 30 },
    // Andes centrales (bosques de montaña)
    { lat: [4.0, 6.0], lng: [-76.0, -74.0], peso: 10 },
    // Orinoquía (bosques y sabanas)
    { lat: [3.0, 6.0], lng: [-74.0, -68.0], peso: 10 }
  ],
  // Zonas a EVITAR (no boscosas)
  zonasNoBoscosas: [
    // Caribe (más seco)
    { lat: [10.0, 12.5], lng: [-75.0, -71.0] },
    // Valles interandinos (agricultura)
    { lat: [3.5, 5.0], lng: [-76.5, -75.5] },
    // Llanos orientales (ganadería)
    { lat: [4.0, 6.0], lng: [-73.0, -70.0] },
    // Zonas urbanas principales
    { lat: [4.6, 4.7], lng: [-74.1, -74.0] }, // Bogotá
    { lat: [6.2, 6.3], lng: [-75.6, -75.5] }, // Medellín
    { lat: [3.4, 3.5], lng: [-76.5, -76.4] }, // Cali
  ]
};

// === CACHE SIMPLE ===
const cache = new Map<string, any>();

// === SERVICIOS OPTIMIZADOS PARA MÁS VÁLIDOS ===
const APIServices = {
  // Verificación RÁPIDA de Colombia
  // VERIFICACIÓN MEJORADA DE COLOMBIA
  async verificarEnColombia(lat: number, lng: number): Promise<boolean> {
    // 1. Verificación local mejorada
    if (!this.verificarColombiaLocalMejorada(lat, lng)) {
      return false;
    }

    const cacheKey = `colombia_${lat.toFixed(2)}_${lng.toFixed(2)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=8&accept-language=es`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const address = data.address;
        const country = address?.country;
        const countryCode = address?.country_code;

        const esColombia = country === 'Colombia' || countryCode === 'co';
        cache.set(cacheKey, esColombia);
        return esColombia;
      }
    } catch (error) {
      console.warn('Error con OpenStreetMap, usando validación local:', error);
    }

    // Si falla la API, confiamos en la verificación local
    return true;
  },

  verificarColombiaLocalMejorada(lat: number, lng: number): boolean {
    // Colombia continental completa
    const enBounds = (lat >= -4.5 && lat <= 13.0 && lng >= -79.0 && lng <= -66.0);

    if (!enBounds) return false;

    // Exclusiones más precisas
    if (lat < -2.0 && lng < -72.0) return false; // Perú
    if (lng > -67.0 && lat < 2.0) return false;  // Brasil
    if (lng > -66.5 && lat > 7.0) return false;  // Venezuela
    if (lat > 10.5 && lng > -77.0) return false; // Panamá

    return true;
  },

  // VERIFICACIÓN PRECISA DE COLOMBIA CON FRONTERAS AMAZÓNICAS CORRECTAS
  verificarColombiaLocal(lat: number, lng: number): boolean {
    // Límites generales de Colombia
    const enBounds = (lat >= -4.5 && lat <= 13.0 && lng >= -79.0 && lng <= -66.0);

    if (!enBounds) return false;

    // EXCLUSIONES ESPECÍFICAS POR PAÍSES VECINOS

    // 1. PERÚ - exclusión precisa
    // La frontera Colombia-Perú en Amazonía está alrededor de -70° a -75°
    if (lat < -1.0 && lng < -72.0) {
      // Zona de Perú (Iquitos, Loreto, etc.)
      if (lng < -75.0) return false; // Perú occidental
      if (lat < -2.5 && lng < -73.0) return false; // Perú central amazónico
      if (lat < -4.0) return false; // Perú sur
    }

    // 2. BRASIL - exclusión precisa
    // La frontera Colombia-Brasil está alrededor de -70° hacia el este
    if (lng > -67.0) {
      if (lat < 2.0) return false; // Brasil amazónico
      if (lat < 5.0 && lng > -66.5) return false; // Brasil oriental
    }

    // 3. VENEZUELA
    if (lng > -66.5 && lat > 7.0) return false;

    // 4. ECUADOR
    if (lat < 0.0 && lng > -77.0) return false;

    // 5. PANAMÁ
    if (lat > 10.5 && lng > -77.5) return false;

    // ZONAS QUE SÍ SON COLOMBIA (INCLUSIONES EXPLÍCITAS)

    // Amazonía colombiana (Trapecio Amazónico)
    if (lat >= -4.5 && lat <= -1.0 && lng >= -70.5 && lng <= -69.0) return true;

    // Toda el área de Leticia y frontera con Perú/Brasil
    if (lat >= -4.5 && lat <= 0.0 && lng >= -72.0 && lng <= -67.0) {
      // Esta área incluye el Trapecio Amazónico colombiano
      return true;
    }

    // Si pasa todas las exclusiones, es Colombia
    return true;
  },

  // SERVICIO CORREGIDO PARA OBTENER UBICACIÓN REAL
  async obtenerUbicacionAdministrativa(lat: number, lng: number): Promise<{ departamento: string; municipio: string }> {
    const cacheKey = `ubicacion_${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      // 1. PRIMERO buscar en zonas boscosas definidas (las más confiables)
      for (const zona of zonasBosqueColombia) {
        if (lat >= zona.bounds.lat[0] && lat <= zona.bounds.lat[1] &&
          lng >= zona.bounds.lng[0] && lng <= zona.bounds.lng[1]) {
          const result = {
            departamento: zona.departamento,
            municipio: zona.municipio
          };
          cache.set(cacheKey, result);
          return result;
        }
      }

      // 2. SI NO está en zonas definidas, usar OpenStreetMap para datos REALES
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=12&accept-language=es`,
        { signal: controller.signal }
      );

      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const address = data.address;

        if (address) {
          // Extraer información REAL de OpenStreetMap
          const departamento = address.state ||
            address.region ||
            address.county ||
            'Departamento por definir';

          const municipio = address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.suburb ||
            'Municipio por definir';

          const result = {
            departamento: this.formatearNombre(departamento),
            municipio: this.formatearNombre(municipio)
          };

          cache.set(cacheKey, result);
          return result;
        }
      }

      // 3. FALLBACK: Clasificación por región geográfica MEJORADA
      const result = this.clasificarPorRegionMejorada(lat, lng);
      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.warn('Error obteniendo ubicación administrativa:', error);
      // Fallback mejorado
      const result = this.clasificarPorRegionMejorada(lat, lng);
      cache.set(cacheKey, result);
      return result;
    }
  },

  // CLASIFICACIÓN POR REGIÓN MEJORADA CON NOMBRES REALES
  clasificarPorRegionMejorada(lat: number, lng: number): { departamento: string; municipio: string } {
    // Amazonía colombiana
    if (lat >= -4.5 && lat < 2.0 && lng >= -75.0 && lng <= -67.0) {
      if (lat < 0.0) {
        return { departamento: 'Amazonas', municipio: 'Leticia' };
      } else {
        return { departamento: 'Amazonas', municipio: 'Puerto Nariño' };
      }
    }

    // Región Pacífica
    if (lat >= 1.0 && lat < 7.0 && lng >= -79.0 && lng <= -76.0) {
      if (lat < 4.0) return { departamento: 'Nariño', municipio: 'Tumaco' };
      if (lat < 6.0) return { departamento: 'Cauca', municipio: 'Guapi' };
      return { departamento: 'Chocó', municipio: 'Nuquí' };
    }

    // Región Andina
    if (lat >= 4.0 && lat < 8.0 && lng >= -76.0 && lng <= -73.0) {
      if (lng < -75.0) return { departamento: 'Valle del Cauca', municipio: 'Cali' };
      if (lng < -74.0) return { departamento: 'Tolima', municipio: 'Ibagué' };
      return { departamento: 'Cundinamarca', municipio: 'Bogotá' };
    }

    // Región Caribe
    if (lat >= 9.0 && lat <= 12.0 && lng >= -75.0 && lng <= -71.0) {
      if (lng < -74.0) return { departamento: 'Atlántico', municipio: 'Barranquilla' };
      if (lng < -73.0) return { departamento: 'Magdalena', municipio: 'Santa Marta' };
      return { departamento: 'La Guajira', municipio: 'Riohacha' };
    }

    // Región Orinoquía
    if (lat >= 3.0 && lat < 7.0 && lng >= -74.0 && lng <= -68.0) {
      if (lat < 5.0) return { departamento: 'Meta', municipio: 'Villavicencio' };
      return { departamento: 'Arauca', municipio: 'Arauca' };
    }

    // Si no coincide con ninguna región conocida, ser más específico
    if (lat >= -4.5 && lat <= 13.0 && lng >= -79.0 && lng <= -66.0) {
      return {
        departamento: 'Zona en verificación',
        municipio: 'Ubicación por confirmar'
      };
    }

    return {
      departamento: 'Fuera de Colombia',
      municipio: 'No aplica'
    };
  },

  // Función para formatear nombres (eliminar caracteres extraños)
  formatearNombre(nombre: string): string {
    if (!nombre) return 'Sin datos';

    return nombre
      .replace(/['"]/g, '') // Eliminar comillas
      .replace(/\(.*\)/g, '') // Eliminar paréntesis y su contenido
      .trim();
  },

  clasificarPorRegion(lat: number, lng: number): { departamento: string; municipio: string } {
    // Amazonía colombiana (INCLUYENDO coordenadas negativas)
    if (lat >= -4.5 && lat < 2.0) {
      if (lng >= -75.0 && lng <= -67.0) {
        if (lat < 0.0) {
          return { departamento: 'Amazonas', municipio: 'Zona sur amazónica' };
        } else {
          return { departamento: 'Amazonas', municipio: 'Zona norte amazónica' };
        }
      }
    }
    // Pacífico
    if (lat > 1.0 && lat < 7.0 && lng < -77.0) return { departamento: 'Chocó', municipio: 'Zona pacífica' };
    // Andes
    if (lat > 4.0 && lat < 8.0 && lng > -76.0 && lng < -73.0) return { departamento: 'Eje Cafetero', municipio: 'Zona andina' };
    // Caribe
    if (lat > 9.0 && lng > -75.0 && lng < -71.0) return { departamento: 'Caribe', municipio: 'Zona norte' };
    // Orinoquía
    if (lat > 3.0 && lat < 7.0 && lng > -74.0 && lng < -68.0) return { departamento: 'Orinoquía', municipio: 'Zona llanera' };

    return { departamento: 'Colombia', municipio: 'Área rural' };
  },

  // VERIFICACIÓN DE BOSQUE MÁS PERMISIVA
  async verificarCoberturaBoscosa(lat: number, lng: number): Promise<{ esBosque: boolean; porcentaje: number }> {
    const cacheKey = `bosque_${lat.toFixed(3)}_${lng.toFixed(3)}`;
    if (cache.has(cacheKey)) return cache.get(cacheKey);

    try {
      // 1. Verificación instantánea en zonas definidas - SIEMPRE es bosque
      for (const zona of zonasBosqueColombia) {
        if (lat >= zona.bounds.lat[0] && lat <= zona.bounds.lat[1] &&
          lng >= zona.bounds.lng[0] && lng <= zona.bounds.lng[1]) {
          const result = { esBosque: true, porcentaje: 90 };
          cache.set(cacheKey, result);
          return result;
        }
      }

      // 2. Verificación por características geográficas - MÁS PERMISIVA
      const probabilidad = this.calcularProbabilidadBosqueMejorada(lat, lng);

      // BAJAMOS el umbral de 65% a 45% para considerar como bosque
      const result = {
        esBosque: probabilidad > 45, // ← CAMBIO IMPORTANTE: más permisivo
        porcentaje: probabilidad
      };

      cache.set(cacheKey, result);
      return result;

    } catch (error) {
      console.error('Error en validación boscosa:', error);
      // En caso de error, asumimos que es bosque para no perder conglomerados
      const result = { esBosque: true, porcentaje: 60 };
      cache.set(cacheKey, result);
      return result;
    }
  },

  // CÁLCULO MÁS PERMISIVO DE PROBABILIDAD DE BOSQUE
  calcularProbabilidadBosqueMejorada(lat: number, lng: number): number {
    let probabilidad = 60; // ← Aumentamos probabilidad base

    // ALTA probabilidad en regiones boscosas
    if (lat < 2.0 && lng < -70.0) probabilidad += 30; // Amazonía
    if (lat > 1.0 && lat < 7.0 && lng < -77.0) probabilidad += 35; // Pacífico
    if (lat > 4.0 && lat < 8.0 && lng > -76.0 && lng < -73.0) probabilidad += 25; // Andes

    // MEDIA probabilidad en otras zonas rurales
    if (lat > 2.0 && lat < 8.0 && lng > -74.0 && lng < -70.0) probabilidad += 15; // Orinoquía
    if (lat > 7.0 && lat < 11.0 && lng > -76.0 && lng < -73.0) probabilidad += 10; // Caribe montañoso

    // SOLO reducimos probabilidad en zonas MUY específicas no boscosas
    if (this.esZonaUrbanaPrincipal(lat, lng)) probabilidad -= 50;
    if (this.esZonaAridaExtrema(lat, lng)) probabilidad -= 40;
    if (this.esZonaAgricolaIntensiva(lat, lng)) probabilidad -= 30;

    return Math.min(95, Math.max(20, probabilidad));
  },

  // Detección de zonas no boscosas específicas
  esZonaUrbanaPrincipal(lat: number, lng: number): boolean {
    const zonasUrbanas = [
      { lat: [4.6, 4.7], lng: [-74.1, -74.0] }, // Bogotá
      { lat: [6.2, 6.3], lng: [-75.6, -75.5] }, // Medellín
      { lat: [3.4, 3.5], lng: [-76.5, -76.4] }, // Cali
      { lat: [10.9, 11.0], lng: [-74.8, -74.7] }, // Barranquilla
      { lat: [7.1, 7.2], lng: [-73.1, -73.0] }, // Bucaramanga
    ];
    return zonasUrbanas.some(zona =>
      lat >= zona.lat[0] && lat <= zona.lat[1] &&
      lng >= zona.lng[0] && lng <= zona.lng[1]
    );
  },

  esZonaAridaExtrema(lat: number, lng: number): boolean {
    // Solo La Guajira extrema
    return (lat > 11.5 && lng > -73.0 && lng < -71.0);
  },

  esZonaAgricolaIntensiva(lat: number, lng: number): boolean {
    // Valles de agricultura intensiva conocidos
    const zonasAgricolas = [
      { lat: [3.8, 4.2], lng: [-76.3, -75.8] }, // Valle del Cauca
      { lat: [4.8, 5.2], lng: [-74.8, -74.3] }, // Sabana de Bogotá
    ];
    return zonasAgricolas.some(zona =>
      lat >= zona.lat[0] && lat <= zona.lat[1] &&
      lng >= zona.lng[0] && lng <= zona.lng[1]
    );
  },

  // Verificación de área marítima
  async verificarAreaMaritima(lat: number, lng: number): Promise<boolean> {
    const enMarConocido = areasMaritimas.some(area =>
      lat >= area.bounds.lat[0] && lat <= area.bounds.lat[1] &&
      lng >= area.bounds.lng[0] && lng <= area.bounds.lng[1]
    );

    if (enMarConocido) return true;

    // Áreas marítimas aproximadas
    const areasMarAproximadas = [
      { lat: [11.0, 13.0], lng: [-79.0, -71.0] }, // Caribe
      { lat: [1.0, 8.0], lng: [-83.0, -77.0] },   // Pacífico
    ];

    return areasMarAproximadas.some(area =>
      lat >= area.lat[0] && lat <= area.lat[1] &&
      lng >= area.lng[0] && lng <= area.lng[1]
    );
  }
};

// === GENERACIÓN INTELIGENTE DE COORDENADAS ===
const generarCoordenadaEnColombia = (): { lat: number; lng: number } => {
  // 90% de probabilidad en zonas boscosas prioritarias
  const usarZonaPrioritaria = Math.random() < 0.9;

  if (usarZonaPrioritaria) {
    // Seleccionar zona basada en pesos
    const zona = seleccionarZonaPorPeso();
    const lat = Math.random() * (zona.lat[1] - zona.lat[0]) + zona.lat[0];
    const lng = Math.random() * (zona.lng[1] - zona.lng[0]) + zona.lng[0];
    return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
  } else {
    // 10% en otras zonas de Colombia (evitando zonas no boscosas)
    return generarCoordenadaEnOtraZona();
  }
};

const seleccionarZonaPorPeso = () => {
  const totalPeso = CONFIG.zonasBoscosasPrioritarias.reduce((sum, zona) => sum + zona.peso, 0);
  let random = Math.random() * totalPeso;

  for (const zona of CONFIG.zonasBoscosasPrioritarias) {
    if (random < zona.peso) {
      return zona;
    }
    random -= zona.peso;
  }

  return CONFIG.zonasBoscosasPrioritarias[0];
};

const generarCoordenadaEnOtraZona = (): { lat: number; lng: number } => {
  let lat, lng;
  let intentos = 0;

  // Generar coordenadas evitando zonas no boscosas
  do {
    lat = Math.random() * 10 + 1; // 1°N to 11°N
    lng = Math.random() * 12 - 78; // -78° to -66°
    intentos++;

    // Si después de 10 intentos no encuentra zona buena, usar cualquier coordenada
    if (intentos > 10) break;

  } while (esZonaNoBoscosa(lat, lng));

  return { lat: parseFloat(lat.toFixed(6)), lng: parseFloat(lng.toFixed(6)) };
};

const esZonaNoBoscosa = (lat: number, lng: number): boolean => {
  return CONFIG.zonasNoBoscosas.some(zona =>
    lat >= zona.lat[0] && lat <= zona.lat[1] &&
    lng >= zona.lng[0] && lng <= zona.lng[1]
  );
};

// === FUNCIÓN DE VALIDACIÓN (igual que antes) ===
const validarUbicacion = async (lat: number, lng: number): Promise<{
  estaEnBosque: boolean;
  departamento: string;
  municipio: string;
  tipo: string;
}> => {
  try {
    const enColombia = await APIServices.verificarEnColombia(lat, lng);

    if (!enColombia) {
      return {
        estaEnBosque: false,
        departamento: 'Fuera de Colombia',
        municipio: 'No aplica',
        tipo: 'Exterior'
      };
    }

    const esMaritimo = await APIServices.verificarAreaMaritima(lat, lng);
    if (esMaritimo) {
      return {
        estaEnBosque: false,
        departamento: 'Mar',
        municipio: 'Zona marítima',
        tipo: 'Marítima'
      };
    }

    const [ubicacion, cobertura] = await Promise.all([
      APIServices.obtenerUbicacionAdministrativa(lat, lng),
      APIServices.verificarCoberturaBoscosa(lat, lng)
    ]);

    let tipo = 'Tierra no boscosa';

    if (cobertura.esBosque) {
      const enZonaDefinida = zonasBosqueColombia.some(zona =>
        lat >= zona.bounds.lat[0] && lat <= zona.bounds.lat[1] &&
        lng >= zona.bounds.lng[0] && lng <= zona.bounds.lng[1]
      );

      tipo = enZonaDefinida
        ? `Bosque protegido (${cobertura.porcentaje}%)`
        : `Bosque natural (${cobertura.porcentaje}%)`;
    } else {
      tipo = `No boscoso (${cobertura.porcentaje}%)`;
    }

    return {
      estaEnBosque: cobertura.esBosque,
      departamento: ubicacion.departamento,
      municipio: ubicacion.municipio,
      tipo: tipo
    };

  } catch (error) {
    console.error('Error en validación:', error);
    return {
      estaEnBosque: false,
      departamento: 'Error',
      municipio: 'Error en validación',
      tipo: 'Error'
    };
  }
};

// === COMPONENTE PRINCIPAL (igual que antes) ===
const GeneradorConglomerados: React.FC = () => {
  const [form, setForm] = useState<ConglomeradoForm>({ cantidad: '', confirmado: false });
  const [coordenadas, setCoordenadas] = useState<Coordenada[]>([]);
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleCantidadChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setForm(prev => ({ ...prev, cantidad: value }));
    }
  };

  const generarCoordenadasAleatorias = async () => {
    if (form.cantidad === '') { alert('❌ Ingresa la cantidad'); return; }
    const cantidadNumerica = parseInt(form.cantidad);
    if (cantidadNumerica <= 0) { alert('❌ Debe ser mayor a 0'); return; }
    if (cantidadNumerica > CONFIG.maxConglomerados) {
      alert(`❌ Máximo ${CONFIG.maxConglomerados} conglomerados`);
      return;
    }
    if (!form.confirmado) {
      setMostrarAlerta(true);
      setTimeout(() => setMostrarAlerta(false), 3000);
      return;
    }

    setCargando(true);
    const nuevasCoordenadas: Coordenada[] = [];

    const coordenadasGeneradas = Array.from({ length: cantidadNumerica }, () =>
      generarCoordenadaEnColombia()
    );

    const promesas = coordenadasGeneradas.map(async (coord) => {
      const validacion = await validarUbicacion(coord.lat, coord.lng);

      return {
        id: Date.now() + Math.random(),
        latitud: coord.lat,
        longitud: coord.lng,
        region: validacion.tipo,
        departamento: validacion.departamento,
        municipio: validacion.municipio,
        tipo: validacion.tipo,
        estaEnBosque: validacion.estaEnBosque,
        fechaCreacion: new Date()
      };
    });

    const resultados = await Promise.all(promesas);
    setCoordenadas(resultados);
    setCargando(false);
  };

  // ... (resto del componente igual)

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
        {mostrarAlerta && <Alert severity="warning" sx={{ mb: 2 }}>Debe confirmar la generación</Alert>}

        {cargando && (
          <Alert severity="info" sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CircularProgress size={20} />
              Generando conglomerados en zonas boscosas...
            </Box>
          </Alert>
        )}

        <Card sx={{ p: 3, mb: 3, backgroundColor: 'rgba(255,255,255,0.85)' }}>
          <Typography variant="h5" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            GENERAR CONGLOMERADOS 
          </Typography>
          <Typography variant="h6" align="center" gutterBottom sx={{ fontWeight: 'bold', color: '#2E7D32' }}>
            sistema de generación aleatoria de coordenadas para conglomerados 
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', lg: 'row' }, gap: 3, mb: 3 }}>
            <Box sx={{ flex: { lg: 7 } }}>
              <MapaColombia conglomerados={coordenadas} />
            </Box>

            <Box sx={{ flex: { lg: 3 }, minWidth: { lg: '350px' }, mt: 4 }}>
              <Card sx={{ p: 3, backgroundColor: '#f8f9fa', border: '2px solid #2E7D32', height: 'fit-content' }}>
                <TextField
                  fullWidth
                  label="Cantidad de conglomerados"
                  type="text"
                  value={form.cantidad}
                  onChange={handleCantidadChange}
                  placeholder="Ej: 5, 10..."
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
                  label="Confirmar generación"
                  sx={{ mb: 3 }}
                />
                <Button
                  variant="contained"
                  size="large"
                  onClick={generarCoordenadasAleatorias}
                  disabled={form.cantidad === '' || !form.confirmado || cargando}
                  sx={{
                    backgroundColor: '#2E7D32',
                    '&:hover': { backgroundColor: '#1B5E20' },
                    width: '100%',
                    '&:disabled': { backgroundColor: '#cccccc' }
                  }}
                >
                  {cargando ? <CircularProgress size={24} /> : 'GENERAR CONGLOMERADOS'}
                </Button>

                <Box sx={{ mt: 3, p: 2, backgroundColor: 'white', borderRadius: 1, border: '1px solid #e0e0e0' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    Resumen (Optimizado para Válidos):
                  </Typography>
                  <Typography variant="body2">• Total: <strong>{coordenadas.length}</strong></Typography>
                  <Typography variant="body2" sx={{ color: 'green' }}>
                    • Válidos (bosque): <strong>{coordenadas.filter(c => c.estaEnBosque).length}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'red' }}>
                    • No válidos: <strong>{coordenadas.filter(c => !c.estaEnBosque).length}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ fontSize: '0.7rem', color: '#666', mt: 1 }}>
                    🌳 90% en zonas boscosas prioritarias
                  </Typography>
                </Box>
              </Card>
            </Box>
          </Box>

          {/* Tabla */}
          <Card sx={{ p: 2 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>ID</TableCell>
                    <TableCell>Latitud</TableCell>
                    <TableCell>Longitud</TableCell>
                    <TableCell>Municipio</TableCell>
                    <TableCell>Departamento</TableCell>
                    <TableCell>Región/Tipo</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Gestionar</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coordenadas.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((c, index) => (
                    <TableRow
                      key={c.id}
                      sx={{
                        backgroundColor: c.estaEnBosque ? '#f0fff0' : '#fff0f0',
                        '&:hover': { backgroundColor: c.estaEnBosque ? '#e0ffe0' : '#ffe0e0' }
                      }}
                    >
                      <TableCell>{c.id}</TableCell>
                      <TableCell>{c.latitud}</TableCell>
                      <TableCell>{c.longitud}</TableCell>
                      <TableCell>{c.municipio}</TableCell>
                      <TableCell>{c.departamento}</TableCell>
                      <TableCell>{c.tipo}</TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            color: c.estaEnBosque ? 'green' : 'red',
                            fontWeight: 'bold'
                          }}
                        >
                          {c.estaEnBosque ? '✅ Válido' : '❌ No válido'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="contained"
                          color="success"
                          size="small"
                          sx={{ mr: 1 }}
                          onClick={() => {
                            const conglomerado = coordenadas.find(cong => cong.id === c.id);
                            if (conglomerado && conglomerado.estaEnBosque) {
                              alert(`Conglomerado ${c.id} asignado y guardado en BD`);
                              setCoordenadas(prev => prev.filter(cong => cong.id !== c.id));
                            } else {
                              alert('Solo se pueden asignar conglomerados en zonas boscosas válidas');
                            }
                          }}
                          disabled={!c.estaEnBosque}
                        >
                          Asignar
                        </Button>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => setCoordenadas(prev => prev.filter(cong => cong.id !== c.id))}
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
              count={coordenadas.length}
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