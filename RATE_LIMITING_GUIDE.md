# 🛡️ Guía de Rate Limiting para MVP

## ✅ IMPLEMENTACIÓN COMPLETADA: Rate Limiting Frontend

### 📋 Resumen de la Implementación
Se ha implementado un sistema completo de rate limiting en el frontend con las siguientes características:

- **LoginForm**: 5 intentos cada 15 minutos, bloqueo de 30 minutos
- **RegisterForm**: 3 intentos cada 15 minutos, bloqueo de 60 minutos
- **Notificaciones visuales** cuando el usuario está bloqueado
- **Optimizaciones de reCAPTCHA** para mejorar el rendimiento
- **Persistencia en localStorage** para mantener el estado entre sesiones

### 🔧 Componentes Implementados

#### 1. Hook useRateLimit
```typescript
// src/hooks/useRateLimit.ts
const { isBlocked, canAttempt, recordAttempt, attemptsRemaining, timeRemaining } = useRateLimit('login_rate_limit', {
  maxAttempts: 5,
  windowMs: 15 * 60 * 1000, // 15 minutos
  blockDurationMs: 30 * 60 * 1000 // 30 minutos
});
```

#### 2. Componente RateLimitNotification
```typescript
// Muestra notificaciones cuando el usuario está bloqueado
<RateLimitNotification
  isBlocked={isBlocked}
  timeRemaining={timeRemaining}
  attemptsRemaining={attemptsRemaining}
  maxAttempts={5}
/>
```

#### 3. Optimizaciones de reCAPTCHA
- **Lazy loading** del componente reCAPTCHA
- **Supresión de advertencias** de longtask
- **Timeout de 10 segundos** para evitar bloqueos
- **Memoización** para evitar re-renders innecesarios

### 📁 Archivos Modificados/Creados

#### Nuevos Archivos:
- `src/components/RateLimitNotification.tsx` - Componente de notificación
- `src/components/LazyRecaptcha.tsx` - Componente lazy para reCAPTCHA
- `src/hooks/useRateLimit.ts` - Hook principal de rate limiting
- `src/utils/recaptchaConfig.ts` - Configuración optimizada de reCAPTCHA
- `src/types/recaptcha.d.ts` - Declaraciones de tipos para reCAPTCHA
- `.vscode/settings.json` - Configuración de cSpell

#### Archivos Modificados:
- `src/auth/components/LoginForm.tsx` - Integración de rate limiting
- `src/auth/components/RegisterForm.tsx` - Integración de rate limiting
- `src/components/RecaptchaWrapper.tsx` - Optimizaciones de rendimiento
- `src/hooks/useRecaptcha.ts` - Mejoras de rendimiento y timeout
- `src/main.tsx` - Aplicación de optimizaciones globales

### 🎯 Configuración por Formulario

#### LoginForm
- **Máximo intentos**: 5
- **Ventana de tiempo**: 15 minutos
- **Duración del bloqueo**: 30 minutos
- **Storage key**: 'login_rate_limit'

#### RegisterForm
- **Máximo intentos**: 3
- **Ventana de tiempo**: 15 minutos
- **Duración del bloqueo**: 60 minutos
- **Storage key**: 'register_rate_limit'

### 🚀 Optimizaciones de Rendimiento

#### reCAPTCHA Optimizations
1. **Lazy Loading**: El componente reCAPTCHA se carga solo cuando es necesario
2. **Script Preloading**: Precarga asíncrona del script de Google reCAPTCHA
3. **Warning Suppression**: Supresión de advertencias de longtask específicas
4. **Timeout Protection**: Timeout de 10 segundos para evitar bloqueos
5. **Memoization**: Uso de React.memo y useCallback para optimizar renders

#### Mejoras de UX
- **Botones deshabilitados** cuando el usuario está bloqueado
- **Indicadores visuales** del estado de bloqueo
- **Contador de tiempo restante** para el desbloqueo
- **Mensajes informativos** sobre intentos restantes

## ⚡ OPCIÓN ALTERNATIVA: Firebase App Check (Para Backend)

### Paso 1: Habilitar App Check en Firebase Console
1. Ve a Firebase Console → App Check
2. Click en "Get Started"
3. Registra tu app web
4. Selecciona reCAPTCHA v3 como proveedor
5. Obtén tu Site Key

### Paso 2: Instalar dependencias
```bash
npm install firebase-app-check
```

### Paso 3: Configurar en tu app
```typescript
// src/firebase/config.ts
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// Después de inicializar Firebase
const appCheck = initializeAppCheck(app, {
  provider: new ReCaptchaV3Provider('TU-RECAPTCHA-SITE-KEY'),
  isTokenAutoRefreshEnabled: true
});
```

### Paso 4: Configurar reglas de Firestore
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Requerir App Check para todas las escrituras
    match /{document=**} {
      allow read: if true;
      allow write: if request.auth != null && request.app != null;
    }
  }
}
```

**Ventajas:**
- ✅ Fácil de implementar
- ✅ Protege contra bots automáticamente
- ✅ Sin costo adicional
- ✅ No afecta UX

**Desventajas:**
- ⚠️ Requiere reCAPTCHA (puede ser molesto)

---

## 🔥 OPCIÓN 2: Rate Limiting en Reglas de Firestore (15 min)

### Implementación básica
```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Rate limiting para likes
    match /interactions/{interactionId} {
      allow read: if true;
      
      // Solo 1 like cada 2 segundos
      allow create: if isAuthenticated() && 
        (!exists(/databases/$(database)/documents/interactions/$(request.auth.uid + '_' + request.resource.data.postId)) ||
         request.time > resource.data.createdAt + duration.value(2, 's'));
    }
    
    // Rate limiting para posts
    match /posts/{postId} {
      allow read: if true;
      
      // Solo 1 post cada 60 segundos
      allow create: if isAuthenticated() && 
        request.time > get(/databases/$(database)/documents/users/$(request.auth.uid)).data.lastPostTime + duration.value(60, 's');
    }
  }
}
```

### Actualizar documento de usuario al crear post
```typescript
// En createPost
await updateDoc(doc(db, 'users', userId), {
  lastPostTime: serverTimestamp()
});
```

**Ventajas:**
- ✅ No requiere código adicional
- ✅ Funciona directamente en Firestore
- ✅ Sin dependencias externas

**Desventajas:**
- ⚠️ Limitado a lo que Firestore puede hacer
- ⚠️ Requiere estructura de datos específica

---

## ⚙️ OPCIÓN 3: Cloud Functions + Redis (Avanzado - 1 hora)

### Paso 1: Crear Cloud Function
```typescript
// functions/src/index.ts
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const rateLimit = new Map<string, number>();

export const createPost = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Usuario no autenticado');
  }
  
  const userId = context.auth.uid;
  const now = Date.now();
  const lastRequest = rateLimit.get(userId) || 0;
  
  // Máximo 1 post por minuto
  if (now - lastRequest < 60000) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Debes esperar 1 minuto entre posts'
    );
  }
  
  rateLimit.set(userId, now);
  
  // Crear post en Firestore
  const postRef = await admin.firestore().collection('posts').add({
    ...data,
    authorId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });
  
  return { postId: postRef.id };
});
```

**Ventajas:**
- ✅ Control total sobre rate limiting
- ✅ Puedes usar Redis para persistencia
- ✅ Lógica compleja permitida

**Desventajas:**
- ❌ Requiere plan Blaze (pago por uso)
- ❌ Más complejo de mantener
- ❌ Latencia adicional

---

## 🎯 RECOMENDACIÓN PARA TU MVP

### Para Deploy Inmediato:
**NO implementar rate limiting ahora**
- Tu sitio es personal
- Firebase tiene límites por defecto
- Las reglas de Firestore ya protegen

### Para Después del Deploy (Semana 1-2):
**Implementar Opción 1: Firebase App Check**
- Fácil y rápido
- Protección contra bots
- Sin afectar UX significativamente

### Para Producción a Largo Plazo:
**Implementar Opción 2: Rate Limiting en Reglas**
- Para acciones críticas (crear posts, likes)
- Complementa App Check
- Sin costo adicional

---

## 📊 Límites por Defecto de Firebase

Firebase ya tiene límites incorporados:

| Acción | Límite por Defecto |
|--------|-------------------|
| Lecturas | 50,000/día (gratis) |
| Escrituras | 20,000/día (gratis) |
| Deletes | 20,000/día (gratis) |
| Conexiones simultáneas | 100,000 |

**Para un MVP personal**: Estos límites son más que suficientes.

---

## ✅ CONCLUSIÓN

**Para tu MVP AHORA:**
- ✅ Reglas de Firestore actualizadas (ya las tienes)
- ✅ Autenticación requerida para escrituras
- ✅ Posts privados protegidos
- ⏸️ Rate limiting: Implementar DESPUÉS del deploy

**Prioridad:**
1. Deploy ahora
2. Monitorear uso en Firebase Console
3. Si ves abuso → Implementar App Check (10 min)
4. Si necesitas más control → Implementar rate limiting en reglas

**¿Procedemos con el deploy?**
