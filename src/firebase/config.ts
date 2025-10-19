// Firebase Configuration - Versión Simplificada
// Configuración base sin emuladores para empezar la integración paso a paso

import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuración desde variables de entorno
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

// Validar que las variables de entorno estén configuradas
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    throw new Error('❌ Firebase no configurado. Verifica tu archivo .env.local')
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Exportar servicios de Firebase
export const auth = getAuth(app)
export const db = getFirestore(app)