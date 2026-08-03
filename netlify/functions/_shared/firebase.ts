// Inicialización del Admin SDK. El FIREBASE_PROJECT_ID apunta al proyecto
// Firestore del sitio (my-page-showcase). En Netlify, si se vincula la
// integración de Firebase/Google se pueden usar credenciales por defecto;
// también se acepta un service account JSON en FIREBASE_SERVICE_ACCOUNT.

import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'my-page-showcase'

function createApp() {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT
  if (serviceAccount) {
    return initializeApp({ credential: cert(JSON.parse(serviceAccount)), projectId: PROJECT_ID })
  }
  return initializeApp({ projectId: PROJECT_ID })
}

export const app = getApps().length ? getApp() : createApp()
export const db = getFirestore(app)
