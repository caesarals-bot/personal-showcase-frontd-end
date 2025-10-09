import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.error('⚠️ Firebase no configurado. Crea un archivo .env.local con tus credenciales.');
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const db = getFirestore(app);
export const storage = getStorage(app)

// 🔥 Conectar a emuladores en desarrollo
// IMPORTANTE: Los emuladores evitan problemas de CORS en localhost
// En producción (deploy), esto se desactiva automáticamente
if (import.meta.env.DEV) {
    try {
        connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
        connectFirestoreEmulator(db, 'localhost', 8080);
        console.log('✅ Conectado a Firebase Emulators (desarrollo)');
    } catch (error) {
        console.warn('⚠️ Emuladores ya conectados');
    }
} else {
    console.log('🔥 Usando Firebase en PRODUCCIÓN');
}

export const analytics = typeof window !== 'undefined' && import.meta.env.PROD
    ? getAnalytics(app)
    : null