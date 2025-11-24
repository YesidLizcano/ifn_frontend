export async function guardarConglomerado(
  conglomerado: ConglomeradoVerificado,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/conglomerados/municipio/${encodeURIComponent(conglomerado.municipio)}/departamento/${encodeURIComponent(conglomerado.departamento)}`;

  const body = {
    fechaInicio: null,
    fechaFinAprox: null,
    fechaFin: null,
    latitud: conglomerado.lat,
    longitud: conglomerado.lon
  };

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!respuesta.ok) {
    let detalle = 'Error al guardar conglomerado';
    try {
      const data = await respuesta.json();
      if (data?.message) detalle = data.message;
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}
// Servicio para verificación geográfica de conglomerados en IFN-CORE


export interface Coordenada {
  latitud: number;
  longitud: number;
}

export interface ConglomeradoVerificado {
  lat: number;
  lon: number;
  departamento: string;
  municipio: string;
  region: string;
}

export async function verificarCoordenadasEnColombia(
  coordenadas: Coordenada[],
  token: string
): Promise<ConglomeradoVerificado[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/conglomerados/verificar-en-colombia`;

  const puntos = coordenadas.map(c => ({ lat: c.latitud, lon: c.longitud }));
  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ puntos }),
  });

  if (!respuesta.ok) {
    let detalle = 'Error en la verificación';
    try {
      const data = await respuesta.json();
      if (data?.message) detalle = data.message;
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

// Listar conglomerados desde IFN-CORE
export interface RawConglomeradoResponse {
  fechaInicio: string | null;
  fechaFinAprox: string | null;
  fechaFin: string | null;
  latitud: number;
  longitud: number;
  municipio_id?: number;
  id: number;
  municipio_nombre: string;
  departamento_nombre: string;
  region: string;
  estado: string;
}

export async function listarConglomerados(token: string): Promise<RawConglomeradoResponse[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/conglomerados`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!respuesta.ok) {
    let detalle = 'Error al listar conglomerados';
    try {
      const data = await respuesta.json();
      if (data?.message) detalle = data.message;
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

// Integrantes - listar por región y rol
export interface Integrante {
  id: number;
  nombre: string;
  rol: string;
  // otros campos que el backend pueda devolver se pueden añadir aquí
  [key: string]: any;
}

/**
 * Lista integrantes activos de la misma región que el departamento especificado,
 * disponibles en el rango de fechas y que tienen el rol especificado.
 * Endpoint: GET /integrantes/region/{departamento_id}?fechainicio=...&fechaFinAprox=...&rol=...
 */
export async function listarIntegrantesPorRegion(
  departamento: string,
  fechaInicio: string,
  fechaFinAprox: string,
  rol: string,
  token: string
): Promise<Integrante[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const cleaned = baseUrl.replace(/\/$/, '');
  const url = `${cleaned}/integrantes/region/${encodeURIComponent(departamento)}` +
    `?fechainicio=${encodeURIComponent(fechaInicio || '')}&fechaFinAprox=${encodeURIComponent(fechaFinAprox || '')}&rol=${encodeURIComponent(rol || '')}`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!respuesta.ok) {
    let detalle = 'Error al listar integrantes por región';
    try {
      const data = await respuesta.json();
      if (data?.message) detalle = data.message;
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}
