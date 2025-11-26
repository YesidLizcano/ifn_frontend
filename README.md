
PAGINA WEB: https://ifnfrontend.vercel.app/


1.Instalar dependencias (solo la primera vez)
npm install

2.Correr el proyecto
npm start

3.npm install swiper
//para el carrusel


4.Rutas 
npm install react-router-dom

5.npm install @mui/icons-material

6.npm install @mui/x-date-pickers date-fns

7.npm install firebase

## Configuración Firebase (Variables de Entorno)

Define las siguientes variables en tu panel de Vercel (Project Settings -> Environment Variables) o en un archivo `.env.local` para desarrollo local. CRA requiere el prefijo `REACT_APP_`.

```
REACT_APP_FIREBASE_API_KEY=TU_API_KEY
REACT_APP_FIREBASE_AUTH_DOMAIN=TU_AUTH_DOMAIN
REACT_APP_FIREBASE_PROJECT_ID=TU_PROJECT_ID
REACT_APP_FIREBASE_STORAGE_BUCKET=TU_STORAGE_BUCKET
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=TU_MESSAGING_SENDER_ID
REACT_APP_FIREBASE_APP_ID=TU_APP_ID
REACT_APP_FIREBASE_MEASUREMENT_ID=TU_MEASUREMENT_ID_OPCIONAL
```

La inicialización se encuentra en `src/firebase.ts` y ya usa estas variables. No coloques los valores reales en el repositorio.

## Autenticación (Login)

Definir también la variable base del microservicio de autenticación:

```
REACT_APP_API_AUTH_URL=https://auth-service-backend-xps2.onrender.com
```

La función de login usa `POST ${REACT_APP_API_AUTH_URL}/auth/login` enviando:

```json
{
	"email": "correo",
	"password": "contraseña"
}
```

Respuesta esperada:

```json
{
	"access_token": "TOKEN_JWT_GENERADO",
	"token_type": "bearer",
	"user": {"name": "Nombre", "email": "correo"}
}
```

El token y datos se guardan en `localStorage` (`access_token`, `usuarioAutenticado`, `usuarioEmail`, `usuarioNombre`).
