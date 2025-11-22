// Servicio de autenticación
// Usa únicamente la variable de entorno REACT_APP_API_AUTH_URL definida en Vercel

export interface AuthSuccessResponse {
  access_token: string;
  token_type: string;
  user: {
    name: string;
    email: string;
  };
}

export async function login(email: string, password: string): Promise<AuthSuccessResponse> {
  const baseUrl = process.env.REACT_APP_API_AUTH_URL;
  // Solo se usa la variable de entorno inyectada por Vercel en build
  if (!baseUrl) {
    throw new Error('Variable REACT_APP_API_AUTH_URL no definida en entorno de despliegue');
  }
  const url = `${baseUrl.replace(/\/$/, '')}/auth/login`;

  const respuesta = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email, password })
  });

  if (!respuesta.ok) {
    let detalle = 'Credenciales inválidas';
    try {
      const data = await respuesta.json();
      if (data?.message) detalle = data.message;
    } catch (_) {
      // ignorar parse error
    }
    throw new Error(detalle);
  }

  const json = (await respuesta.json()) as AuthSuccessResponse;
  if (!json.access_token) {
    throw new Error('Respuesta de autenticación incompleta');
  }
  return json;
}
