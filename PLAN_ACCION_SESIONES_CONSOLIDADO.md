# 🔐 Plan de Acción Consolidado: Sistema de Sesiones Únicas para Administradores

## 📋 **Análisis Combinado y Plan Definitivo**

### 🎯 **Objetivo Unificado**
Implementar un sistema robusto de gestión de sesiones que garantice **una sola sesión activa por usuario administrador**, con auto-logout por inactividad y notificaciones elegantes.

---

## 🔍 **Análisis de Fortalezas Combinadas**

### ✅ **Del Plan Original (TAREAS_SESIONES_ADMIN.md)**:
- Estructura organizacional clara con prioridades
- Consideraciones completas de UX/UI
- Casos de prueba exhaustivos
- Estimaciones de tiempo realistas

### ✅ **De las Recomendaciones Técnicas**:
- Implementación específica con código funcional
- Integración perfecta con la arquitectura Firebase existente
- Reutilización de funciones de seguridad (`isAdmin()`, `isAuthenticated()`)
- Hooks React optimizados y listos para usar

---

## 🚀 **Plan de Implementación Definitivo**

### **Fase 1: Configuración Base** ⏱️ *2-3 horas*

#### 1.1 **Reglas de Firestore**
```javascript
// Agregar al final de firestore.rules
// ===== Reglas para gestión de sesiones de administrador =====
match /admin-sessions/{userId} {
  allow read, write: if isAuthenticated() && request.auth.uid == userId && isAdmin();
}
```

#### 1.2 **Estructura de Datos Optimizada**
```typescript
interface AdminSession {
  userId: string;
  sessionId: string; // UUID único por sesión
  deviceInfo: string; // Navigator.userAgent
  loginTime: Timestamp;
  lastActivity: Timestamp;
  isActive: boolean;
  ipAddress?: string; // Opcional
  browserFingerprint?: string; // Para mejor identificación
  expiresAt: Timestamp; // Tiempo de expiración explícito
}
```

### **Fase 2: Servicios Core** ⏱️ *4-5 horas*

#### 2.1 **Crear: `src/services/sessionService.ts`**
```typescript
import { doc, setDoc, updateDoc, onSnapshot, serverTimestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { db } from "@/firebase";

export const createAdminSession = async (user: any) => {
  const sessionId = uuidv4();
  const sessionData = {
    userId: user.uid,
    sessionId,
    deviceInfo: navigator.userAgent,
    loginTime: serverTimestamp(),
    lastActivity: serverTimestamp(),
    isActive: true,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
  };
  
  await setDoc(doc(db, "admin-sessions", user.uid), sessionData);
  localStorage.setItem("sessionId", sessionId);
  return sessionId;
};

export const closeAdminSession = async (user: any) => {
  await updateDoc(doc(db, "admin-sessions", user.uid), {
    isActive: false,
    lastActivity: serverTimestamp()
  });
  localStorage.removeItem("sessionId");
};

export const listenToSessionChanges = (user: any, logoutCallback: () => void) => {
  const localSessionId = localStorage.getItem("sessionId");
  
  return onSnapshot(doc(db, "admin-sessions", user.uid), (snapshot) => {
    const data = snapshot.data();
    if (data && data.sessionId !== localSessionId) {
      logoutCallback();
    }
  });
};
```

#### 2.2 **Crear: `src/hooks/useSessionManager.ts`**
```typescript
import { useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import { createAdminSession, closeAdminSession, listenToSessionChanges } from "@/services/sessionService";
import { useNotifications } from "./useNotifications";

export function useSessionManager() {
  const { user, logout } = useAuth();
  const { showNotification } = useNotifications();

  const handleSessionConflict = useCallback(() => {
    showNotification({
      type: "warning",
      title: "Sesión cerrada",
      message: "Tu sesión ha sido cerrada porque iniciaste sesión en otro dispositivo.",
      duration: 5000
    });
    logout();
  }, [logout, showNotification]);

  useEffect(() => {
    if (!user) return;

    let unsubscribe: (() => void) | null = null;

    const initSession = async () => {
      try {
        await createAdminSession(user);
        unsubscribe = listenToSessionChanges(user, handleSessionConflict);
      } catch (error) {
        console.error("Error initializing session:", error);
      }
    };

    initSession();

    return () => {
      if (unsubscribe) unsubscribe();
      if (user) closeAdminSession(user);
    };
  }, [user, handleSessionConflict]);
}
```

#### 2.3 **Crear: `src/hooks/useInactivityTimer.ts`**
```typescript
import { useEffect, useRef, useCallback } from "react";
import { useAuth } from "./useAuth";
import { useNotifications } from "./useNotifications";

export function useInactivityTimer(timeout = 30 * 60 * 1000) { // 30 minutos
  const { logout } = useAuth();
  const { showNotification } = useNotifications();
  const timer = useRef<NodeJS.Timeout>();
  const warningTimer = useRef<NodeJS.Timeout>();

  const showWarning = useCallback(() => {
    showNotification({
      type: "warning",
      title: "Sesión por expirar",
      message: "Tu sesión expirará en 2 minutos por inactividad.",
      duration: 10000,
      action: {
        label: "Mantener sesión",
        onClick: resetTimer
      }
    });
  }, []);

  const handleTimeout = useCallback(() => {
    showNotification({
      type: "error",
      title: "Sesión expirada",
      message: "Tu sesión ha expirado por inactividad.",
      duration: 5000
    });
    logout();
  }, [logout]);

  const resetTimer = useCallback(() => {
    clearTimeout(timer.current);
    clearTimeout(warningTimer.current);
    
    // Warning 2 minutos antes
    warningTimer.current = setTimeout(showWarning, timeout - 2 * 60 * 1000);
    // Logout después del timeout completo
    timer.current = setTimeout(handleTimeout, timeout);
  }, [timeout, showWarning, handleTimeout]);

  useEffect(() => {
    const events = ["mousemove", "keypress", "click", "scroll", "visibilitychange"];
    
    const handleActivity = () => {
      if (document.visibilityState === "visible") {
        resetTimer();
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity));
    resetTimer();

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      clearTimeout(timer.current);
      clearTimeout(warningTimer.current);
    };
  }, [resetTimer]);
}
```

### **Fase 3: Componentes UI** ⏱️ *3-4 horas*

#### 3.1 **Crear: `src/admin/components/SessionWarningModal.tsx`**
```typescript
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface SessionWarningModalProps {
  isOpen: boolean;
  onExtendSession: () => void;
  onLogout: () => void;
  timeRemaining: number;
}

export function SessionWarningModal({ 
  isOpen, 
  onExtendSession, 
  onLogout, 
  timeRemaining 
}: SessionWarningModalProps) {
  const [countdown, setCountdown] = useState(timeRemaining);

  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          onLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, onLogout]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={isOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            ⏰ Sesión por expirar
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Tu sesión expirará en <strong>{formatTime(countdown)}</strong> por inactividad.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onLogout}>
              Cerrar sesión
            </Button>
            <Button onClick={onExtendSession}>
              Mantener sesión activa
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
```

#### 3.2 **Actualizar: `src/admin/layouts/AdminLayout.tsx`**
```typescript
// Agregar al AdminLayout existente
import { useSessionManager } from "@/hooks/useSessionManager";
import { useInactivityTimer } from "@/hooks/useInactivityTimer";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  // Hooks existentes...
  
  // Nuevos hooks de sesión
  useSessionManager();
  useInactivityTimer(30 * 60 * 1000); // 30 minutos

  return (
    // Layout existente...
  );
}
```

### **Fase 4: Integración y Testing** ⏱️ *2-3 horas*

#### 4.1 **Casos de Prueba Prioritarios**
```typescript
// test/sessionManager.test.ts
describe("Session Manager", () => {
  test("should close previous session when logging in from another device", async () => {
    // Implementar test de sesión duplicada
  });

  test("should show warning before auto-logout", async () => {
    // Implementar test de inactividad
  });

  test("should maintain session on page refresh", async () => {
    // Implementar test de persistencia
  });
});
```

#### 4.2 **Verificaciones de Seguridad**
- ✅ Solo usuarios admin pueden crear sesiones
- ✅ Cada usuario solo puede tener una sesión activa
- ✅ Tokens se limpian correctamente al cerrar sesión
- ✅ Listeners se desconectan apropiadamente

---

## 📊 **Cronograma de Implementación**

| Fase | Duración | Prioridad | Dependencias |
|------|----------|-----------|--------------|
| **Fase 1**: Configuración Base | 2-3h | 🔴 Alta | Firestore rules |
| **Fase 2**: Servicios Core | 4-5h | 🔴 Alta | Fase 1 |
| **Fase 3**: Componentes UI | 3-4h | 🟡 Media | Fase 2 |
| **Fase 4**: Testing | 2-3h | 🟡 Media | Fases 1-3 |
| **Total** | **11-15h** | | |

---

## 🔧 **Archivos a Crear/Modificar**

### **Nuevos Archivos**:
- ✅ `src/services/sessionService.ts`
- ✅ `src/hooks/useSessionManager.ts`
- ✅ `src/hooks/useInactivityTimer.ts`
- ✅ `src/admin/components/SessionWarningModal.tsx`
- ✅ `src/types/session.types.ts`

### **Archivos a Modificar**:
- ✅ `firestore.rules` - Agregar reglas de sesión
- ✅ `src/admin/layouts/AdminLayout.tsx` - Integrar hooks
- ✅ `src/contexts/AuthContext.tsx` - Integrar gestión de sesión
- ✅ `src/hooks/useNotifications.ts` - Extender para sesiones

---

## 🎯 **Beneficios del Plan Consolidado**

### **Seguridad Mejorada**:
- ✅ Una sola sesión activa por admin
- ✅ Auto-logout por inactividad
- ✅ Detección de sesiones duplicadas
- ✅ Reutilización de funciones de seguridad existentes

### **Experiencia de Usuario**:
- ✅ Notificaciones elegantes (no alerts)
- ✅ Opción de extender sesión
- ✅ Feedback visual claro
- ✅ Persistencia inteligente

### **Mantenibilidad**:
- ✅ Código modular y reutilizable
- ✅ Hooks especializados
- ✅ Integración no invasiva
- ✅ Testing estructurado

---

## 🔒 **Consideraciones de Seguridad Adicionales**

1. **Tokens JWT**: Configurar expiración corta (15 min)
2. **Refresh Automático**: Implementar refresh silencioso
3. **Rate Limiting**: Limitar intentos de login (ya implementado)
4. **Audit Log**: Registrar eventos de sesión en `/admin-logs`
5. **Cleanup Automático**: Cloud Function para limpiar sesiones expiradas

---

## 📈 **Métricas de Éxito**

- ✅ **0 sesiones duplicadas** detectadas en producción
- ✅ **< 2 segundos** tiempo de detección de sesión duplicada
- ✅ **100% de usuarios** reciben notificación antes del auto-logout
- ✅ **0 pérdidas de datos** durante cambios de sesión

---

## 📝 **Notas de Implementación**

### **Dependencias Requeridas**:
```json
{
  "uuid": "^9.0.0",
  "@types/uuid": "^9.0.0"
}
```

### **Variables de Entorno**:
```env
VITE_SESSION_TIMEOUT=1800000  # 30 minutos en ms
VITE_SESSION_WARNING=120000   # 2 minutos en ms
```

---

**📅 Fecha de Creación**: 2025-01-XX  
**👨‍💻 Autor**: Plan Consolidado - César Augusto Londoño  
**🔄 Estado**: Listo para implementación  
**🔴 Prioridad**: Alta  
**⏱️ Estimación Total**: 11-15 horas de desarrollo