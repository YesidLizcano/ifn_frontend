export async function guardarConglomerado(
  conglomerado: ConglomeradoVerificado,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/conglomerados/municipio/${encodeURIComponent(conglomerado.municipio)}/departamento/${encodeURIComponent(conglomerado.departamento)}`;

  const body = {
    lat: conglomerado.lat,
    lon: conglomerado.lon,
    region: conglomerado.region
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
