// Servicio para verificación geográfica de conglomerados en IFN-CORE

export interface Coordenada {
  latitud: number;
  longitud: number;
}

export async function verificarCoordenadasEnColombia(
  coordenadas: Coordenada[],
  token: string
): Promise<Coordenada[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/conglomerados/verificar-en-colombia`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(coordenadas),
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
