import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export const getUserRole = async (uid: string): Promise<'admin' | 'user' | 'guest'> => {
    try {
        // Timeout de 3 segundos para evitar que se quede colgado por CORS
        const timeoutPromise = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('Timeout al obtener rol')), 3000)
        );

        const getUserPromise = getDoc(doc(db, 'users', uid));

        const userDoc = await Promise.race([getUserPromise, timeoutPromise]);

        if (userDoc.exists()) {
            const data = userDoc.data();
            return data.role || 'user';
        }

        return 'user';
    } catch (error) {
        // No se pudo obtener rol desde Firestore (CORS en desarrollo). Usando rol por defecto
        // Retornar rol por defecto si falla
        return 'user';
    }
};

export const createUserDocument = async (
    uid: string,
    email: string,
    displayName: string,
    role: 'admin' | 'user' = 'user'
): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);

        // ❌ NO incluimos password
        await setDoc(userRef, {
            email,
            displayName,
            role,
            isActive: true,
            createdAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error al crear documento de usuario:', error);
        throw error;
    }
};

const ADMIN_EMAILS = [
    'caesarals@gmail.com', 
];

export const shouldBeAdmin = (email: string): boolean => {
    return ADMIN_EMAILS.includes(email.toLowerCase());
};