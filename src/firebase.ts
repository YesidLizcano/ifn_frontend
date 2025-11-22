// Inicialización de Firebase usando variables de entorno (CRA requiere prefijo REACT_APP_)
// Asegúrate de definir estas variables en Vercel y/o en un archivo .env.local
import { initializeApp } from 'firebase/app';
// Importa otros SDK según lo necesites (auth, firestore, storage, etc.)
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';
import { getAnalytics, Analytics } from 'firebase/analytics';

interface FirebaseConfig {
  apiKey: string | undefined;
  authDomain: string | undefined;
  projectId: string | undefined;
  storageBucket: string | undefined;
  messagingSenderId: string | undefined;
  appId: string | undefined;
  measurementId?: string | undefined;
}

const firebaseConfig: FirebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Inicializa la app sólo si la clave principal existe
if (!firebaseConfig.apiKey) {
  // Aviso en desarrollo si falta configuración
  // eslint-disable-next-line no-console
  console.warn('Firebase: Falta REACT_APP_FIREBASE_API_KEY. Revisa tus variables de entorno.');
}

export const firebaseApp = initializeApp(firebaseConfig as unknown as Record<string, string>);

// Inicializa Analytics sólo en navegador y si measurementId está definido
let analytics: Analytics | undefined;
if (typeof window !== 'undefined' && firebaseConfig.measurementId) {
  try {
    analytics = getAnalytics(firebaseApp);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Firebase Analytics no disponible:', e);
  }
}

export { analytics };
