# 🔐 Tareas: Gestión de Sesiones de Administrador

## 📋 **Requerimientos de Seguridad**

### 🎯 **Objetivo Principal**
Implementar un sistema de gestión de sesiones más robusto para el panel de administración que garantice que solo haya una sesión activa por usuario administrador.

---

## 🚀 **Tareas Prioritarias**

### 1. 🔄 **Sesión Única por Usuario Admin**
**Problema**: Cuando un admin se loguea en un navegador, puede abrir otra sesión en otro navegador con el mismo usuario.

**Solución Requerida**:
- ✅ Detectar cuando el mismo usuario admin se loguea desde otro navegador/dispositivo
- ✅ Cerrar automáticamente la sesión anterior
- ✅ Mostrar notificación en la sesión que se va a cerrar: "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo"
- ✅ Redirigir a la página de login

**Implementación Sugerida**:
- Usar Firebase Auth con tokens de sesión únicos
- Implementar listener en tiempo real para detectar nuevas sesiones
- Usar Firestore para trackear sesiones activas por usuario

---

### 2. ⏰ **Auto-logout por Inactividad**
**Problema**: Si la página del admin permanece cerrada o inactiva por cierto tiempo, debería cerrar la sesión automáticamente.

**Solución Requerida**:
- ✅ Implementar timeout de inactividad (sugerido: 30 minutos)
- ✅ Detectar cuando la pestaña/ventana está inactiva
- ✅ Mostrar warning antes del auto-logout (ej: "Tu sesión expirará en 2 minutos")
- ✅ Permitir extender la sesión con un botón "Mantener sesión activa"
- ✅ Auto-logout y redirección a login cuando expire

**Implementación Sugerida**:
- Usar `document.visibilityState` para detectar inactividad
- Implementar countdown timer
- Usar localStorage para persistir tiempo de última actividad

---

## 🔧 **Archivos a Modificar**

### **Frontend**:
- `src/contexts/AuthContext.tsx` - Gestión de sesiones
- `src/hooks/useAuth.ts` - Lógica de autenticación
- `src/services/authService.ts` - Servicios de auth
- `src/admin/layouts/AdminLayout.tsx` - Layout del admin
- Crear: `src/hooks/useSessionManager.ts` - Hook para gestión de sesiones
- Crear: `src/hooks/useInactivityTimer.ts` - Hook para timeout

### **Backend/Firebase**:
- `firestore.rules` - Reglas para colección de sesiones
- Crear colección: `/admin-sessions/{userId}` en Firestore

---

## 📊 **Estructura de Datos Sugerida**

### **Firestore: `/admin-sessions/{userId}`**
```typescript
interface AdminSession {
  userId: string;
  sessionId: string; // UUID único por sesión
  deviceInfo: string; // Navigator.userAgent
  loginTime: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
  ipAddress?: string; // Opcional
}
```

---

## 🎨 **UX/UI Consideraciones**

### **Notificaciones**:
- 🔔 "Nueva sesión detectada en otro dispositivo"
- ⏰ "Tu sesión expirará en X minutos"
- 🚪 "Sesión cerrada por inactividad"
- 🔄 "Sesión cerrada: login desde otro dispositivo"

### **Componentes Nuevos**:
- `SessionWarningModal` - Modal de advertencia de expiración
- `SessionConflictNotification` - Notificación de sesión duplicada
- `InactivityTimer` - Componente invisible para manejar timeout

---

## 🔒 **Consideraciones de Seguridad**

1. **Tokens JWT**: Usar tokens con expiración corta
2. **Refresh Tokens**: Implementar refresh automático
3. **Rate Limiting**: Limitar intentos de login
4. **Audit Log**: Registrar todas las actividades de sesión
5. **Encryption**: Encriptar datos sensibles en localStorage

---

## 📈 **Prioridad de Implementación**

1. **Alta** 🔴: Sesión única por usuario admin
2. **Media** 🟡: Auto-logout por inactividad  
3. **Baja** 🟢: Audit log y métricas avanzadas

---

## 🧪 **Testing**

### **Casos de Prueba**:
- ✅ Login simultáneo en 2 navegadores diferentes
- ✅ Inactividad por 30+ minutos
- ✅ Cerrar pestaña y reabrir
- ✅ Pérdida de conexión a internet
- ✅ Refresh de página durante sesión activa

---

## 📝 **Notas Adicionales**

- Considerar usar **Firebase Auth State Persistence** para mejor UX
- Implementar **graceful degradation** si Firestore no está disponible
- Agregar **analytics** para monitorear patrones de uso de admin
- Documentar el flujo en `docs/admin-session-management.md`

---

**Fecha de Creación**: $(date)  
**Estimación**: 1-2 días de desarrollo  
**Desarrollador**: [Tu nombre]  
**Estado**: 📋 Pendiente