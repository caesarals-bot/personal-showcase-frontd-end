# 🔐 Recomendaciones de Implementación — Sistema de Sesiones Únicas para Administradores

## 🎯 Objetivo General
Garantizar que **solo exista una sesión activa por usuario administrador**, detectando logins duplicados y cerrando automáticamente la sesión anterior.

---

## 📦 Contexto de Seguridad Actual (según tus reglas Firestore)

Tu configuración actual ya incluye:

- Verificación de usuario autenticado (`isAuthenticated()`)
- Control de roles (`isAdmin()`)
- Acceso restringido a escritura para colecciones críticas (`settings`, `portfolio`, `about`, etc.)

➡️ La nueva capa de **gestión de sesión** complementará esas reglas sin modificarlas, añadiendo una colección adicional y un hook de control.

---

## 🧠 Descripción del Flujo de Sesión Única

1. El usuario administrador inicia sesión.
2. Se genera un **`sessionId`** único (UUID).
3. Se guarda en Firestore bajo `/admin-sessions/{userId}` con `isActive: true`.
4. Si el mismo usuario inicia sesión desde otro navegador o dispositivo:
   - El nuevo `sessionId` reemplaza al anterior.
   - La sesión previa detecta el cambio mediante un **listener en tiempo real** (`onSnapshot`).
   - Se ejecuta un **logout forzado** en el primer navegador con una notificación.

---

## ⚙️ Estructura de Colección `/admin-sessions`

```typescript
interface AdminSession {
  userId: string;
  sessionId: string;
  deviceInfo: string;
  loginTime: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
  ipAddress?: string; // opcional
}
