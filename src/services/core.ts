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
  // El backend devuelve campos como en el ejemplo:
  // { id, nombreCompleto, jefeBrigada, botanico, auxiliar, coinvestigador, telefono, email, municipio_id, estado }
  nombre?: string; // antiguo campo opcional
  nombreCompleto?: string;
  rol?: string;
  jefeBrigada?: boolean;
  botanico?: boolean;
  auxiliar?: boolean;
  coinvestigador?: boolean;
  telefono?: string;
  email?: string;
  municipio_id?: number;
  estado?: string;
  [key: string]: any;
}

/**
 * Lista integrantes activos de la misma región que el departamento especificado,
 * disponibles en el rango de fechas y que tienen el rol especificado.
 * Endpoint example: GET /integrantes/region/{departamento}?fechaInicio=YYYY-MM-DD&fechaFinAprox=YYYY-MM-DD
 */
export async function listarIntegrantesPorRegion(
  departamento: string,
  fechaInicio: string,
  fechaFinAprox: string,
  token: string
): Promise<Integrante[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const cleaned = baseUrl.replace(/\/$/, '');
  // Usar exactamente `fechaInicio` y `fechaFinAprox` en la consulta (case-sensitive)
  const url = `${cleaned}/integrantes/region/${encodeURIComponent(departamento)}` +
    `?fechaInicio=${encodeURIComponent(fechaInicio || '')}&fechaFinAprox=${encodeURIComponent(fechaFinAprox || '')}`;

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

// Asignar brigada a un conglomerado
export interface IntegranteAsignado {
  integrante_id: number;
  rol_asignado: string;
}

export interface BrigadaCrear {
  fechaCreacion: string;
  estado: string;
  fechaInicio: string;
  fechaFinAprox: string;
  integrantes_asignados: IntegranteAsignado[];
}

export async function asignarBrigada(
  conglomeradoId: number,
  brigada: BrigadaCrear,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/brigadas/${conglomeradoId}`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(brigada),
  });

  if (!respuesta.ok) {
    let detalle = 'Error al asignar la brigada';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

// Eliminar un conglomerado
export async function eliminarConglomerado(
  conglomeradoId: number,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/conglomerados/${conglomeradoId}`;

  const respuesta = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    let detalle = 'Error al eliminar el conglomerado';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  // El DELETE puede no devolver cuerpo o devolver un mensaje de éxito
  try {
    return await respuesta.json();
  } catch (e) {
    return { success: true };
  }
}

// Listar brigadas
export interface RawBrigadaResponse {
  fechaCreacion: string;
  estado: string;
  conglomerado_id: number;
  id: number;
  integrantes: string;
  municipio: string;
  fechaInicio: string;
  fechaFinAprox: string;
}

export async function listarBrigadas(token: string): Promise<RawBrigadaResponse[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/brigadas`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!respuesta.ok) {
    let detalle = 'Error al listar brigadas';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

export interface BrigadaIntegranteDetalle {
  id_brigada: number;
  id_integrante: number;
  rol: string;
  nombreCompleto: string;
  telefono: string;
  email: string;
  estado: string;
}

export async function listarIntegrantesBrigada(
  brigadaId: number,
  token: string
): Promise<BrigadaIntegranteDetalle[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/integrantes/brigada/${brigadaId}`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!respuesta.ok) {
    let detalle = 'Error al listar integrantes de la brigada';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

// Eliminar integrante de brigada
export async function eliminarIntegranteBrigada(
  brigadaId: number,
  integranteId: number,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/brigadas/${brigadaId}/integrantes/${integranteId}`;

  const respuesta = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    let detalle = 'Error al eliminar integrante de la brigada';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  try {
    return await respuesta.json();
  } catch (e) {
    return { success: true };
  }
}

// Agregar integrante a brigada
export async function agregarIntegranteBrigada(
  brigadaId: number,
  integranteId: number,
  rol: string,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/brigadas/${brigadaId}/integrantes/${integranteId}`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ rol }),
  });

  if (!respuesta.ok) {
    let detalle = 'Error al agregar integrante a la brigada';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  try {
    return await respuesta.json();
  } catch (e) {
    return { success: true };
  }
}

// Herramientas / Materiales y Equipos

export interface Herramienta {
  id: number;
  nombre: string;
  cantidad: number;
  departamento_id: number;
}

export async function listarHerramientas(
  nombreDepartamento: string,
  token: string
): Promise<Herramienta[]> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/materiales_equipos?nombre_departamento=${encodeURIComponent(nombreDepartamento)}`;

  const respuesta = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    }
  });

  if (!respuesta.ok) {
    let detalle = 'Error al listar herramientas';
    try {
      const data = await respuesta.json();
      if (data?.message) detalle = data.message;
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

export async function crearHerramienta(
  departamentoId: number,
  nombre: string,
  cantidad: number,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/materiales_equipos/${departamentoId}`;

  const body = {
    nombre,
    cantidad
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
    let detalle = 'Error al crear herramienta';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

export async function actualizarHerramienta(
  id: number,
  nombre: string,
  cantidad: number,
  departamentoId: number,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/materiales_equipos/${id}`;

  const body = {
    nombre,
    cantidad,
    departamento_id: departamentoId
  };

  const respuesta = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!respuesta.ok) {
    let detalle = 'Error al actualizar herramienta';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  return await respuesta.json();
}

// Eliminar herramienta / material o equipo
export async function eliminarHerramienta(
  materialEquipoId: number,
  token: string
): Promise<any> {
  const baseUrl = process.env.REACT_APP_API_CORE_URL;
  if (!baseUrl) throw new Error('Variable REACT_APP_API_CORE_URL no definida');
  const url = `${baseUrl.replace(/\/$/, '')}/materiales_equipos/${materialEquipoId}`;

  const respuesta = await fetch(url, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!respuesta.ok) {
    let detalle = 'Error al eliminar herramienta';
    try {
      const data = await respuesta.json();
      if (data?.detail) {
        detalle = data.detail;
      } else if (data?.message) {
        detalle = data.message;
      }
    } catch (_) {}
    throw new Error(detalle);
  }

  try {
    return await respuesta.json();
  } catch (e) {
    return { success: true };
  }
}
