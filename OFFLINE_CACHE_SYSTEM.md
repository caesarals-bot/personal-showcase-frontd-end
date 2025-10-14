# 📦 Sistema de Caché Offline

> **Fecha de implementación**: 14 de octubre de 2025
> **Estado**: ✅ Completado

---

## 📋 Descripción

Sistema completo de caché offline que permite que la aplicación funcione sin conexión a internet, proporcionando una experiencia de usuario fluida incluso cuando no hay conectividad.

---

## 🏗️ Arquitectura

### **Componentes Principales**

1. **connectionService.ts** - Gestión de estado de conexión
2. **cacheService.ts** - Gestión de caché en localStorage
3. **useOfflineData.ts** - Hook reutilizable para datos offline
4. **OfflineBanner.tsx** - Indicador visual de estado
5. **defaultAbout.ts** - Datos por defecto

---

## 🔧 Servicios

### **1. Connection Service**

Detecta y monitorea el estado de conexión a internet y Firestore.

```typescript
import { connectionService } from '@/services/connectionService'

// Verificar si está online
const isOnline = connectionService.isOnline()

// Obtener estado completo
const state = connectionService.getConnectionStatus()
// { isOnline: true, isFirestoreAvailable: false, status: 'degraded' }

// Escuchar cambios de conexión
const unsubscribe = connectionService.onConnectionChange((state) => {
    console.log('Estado de conexión:', state)
})

// Limpiar listener
unsubscribe()
```

**Estados de conexión:**
- `online` - Conectado con Firestore disponible
- `offline` - Sin conexión a internet
- `degraded` - Conectado pero sin Firestore

---

### **2. Cache Service**

Gestiona el almacenamiento en caché con TTL (Time To Live) y versionado.

```typescript
import { cacheService } from '@/services/cacheService'

// Guardar en caché (TTL: 24 horas por defecto)
cacheService.setCache('about-data', data, {
    ttl: 24 * 60 * 60 * 1000, // 24 horas
    version: '1.0'
})

// Obtener del caché
const cachedData = cacheService.getCache('about-data', {
    version: '1.0'
})

// Verificar si existe caché válido
const hasCache = cacheService.hasValidCache('about-data')

// Limpiar caché específico
cacheService.removeCache('about-data')

// Limpiar todo el caché
cacheService.clearAllCache()

// Limpiar solo caché expirado
cacheService.clearExpiredCache()

// Obtener tamaño del caché
const size = cacheService.getCacheSizeFormatted() // "1.2 MB"
```

**Características:**
- ✅ TTL configurable
- ✅ Versionado de caché
- ✅ Limpieza automática de caché expirado
- ✅ Manejo de errores robusto
- ✅ Información de tamaño y estadísticas

---

## 🎣 Hook useOfflineData

Hook reutilizable que implementa la estrategia de fallback automático.

### **Estrategia de Fallback**

1. **Network First** - Intenta obtener datos de la red
2. **Cache Fallback** - Si falla, usa caché
3. **Default Fallback** - Si no hay caché, usa datos por defecto

### **Uso Básico**

```typescript
import { useOfflineData } from '@/hooks/useOfflineData'
import { defaultAboutData } from '@/data/defaults/defaultAbout'
import { getAboutData } from '@/services/aboutService'

function AboutPage() {
    const {
        data,
        loading,
        error,
        source,
        connectionState,
        refetch,
        clearCache
    } = useOfflineData({
        key: 'about-data',
        fetchFn: getAboutData,
        defaultData: defaultAboutData,
        cacheTTL: 24 * 60 * 60 * 1000, // 24 horas
        cacheVersion: '1.0',
        enableCache: true,
        refetchOnReconnect: true
    })

    return (
        <div>
            {/* Mostrar banner de estado */}
            <OfflineBanner
                connectionState={connectionState}
                dataSource={source}
                onRetry={refetch}
            />

            {/* Renderizar datos */}
            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div>
                    <h1>{data.title}</h1>
                    <p>Fuente: {source}</p>
                </div>
            )}
        </div>
    )
}
```

### **Opciones del Hook**

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `key` | `string` | - | Clave única para el caché (requerido) |
| `fetchFn` | `() => Promise<T>` | - | Función para obtener datos (requerido) |
| `defaultData` | `T` | - | Datos por defecto (requerido) |
| `cacheTTL` | `number` | 24h | Tiempo de vida del caché en ms |
| `cacheVersion` | `string` | '1.0' | Versión del caché |
| `enableCache` | `boolean` | `true` | Habilitar caché |
| `refetchOnReconnect` | `boolean` | `true` | Refetch al reconectar |

### **Valores de Retorno**

| Valor | Tipo | Descripción |
|-------|------|-------------|
| `data` | `T` | Datos actuales |
| `loading` | `boolean` | Estado de carga |
| `error` | `Error \| null` | Error si existe |
| `source` | `DataSource` | Fuente de los datos |
| `connectionState` | `ConnectionState` | Estado de conexión |
| `refetch` | `() => Promise<void>` | Función para refetch manual |
| `clearCache` | `() => void` | Función para limpiar caché |

### **Fuentes de Datos (DataSource)**

- `network` - Datos obtenidos de la red
- `cache` - Datos obtenidos del caché
- `default` - Datos por defecto
- `none` - Sin datos aún

---

## 🎨 Componente OfflineBanner

Banner visual que muestra el estado de conexión y fuente de datos.

```typescript
import OfflineBanner from '@/components/OfflineBanner'

<OfflineBanner
    connectionState={connectionState}
    dataSource={source}
    onRetry={refetch}
    showDetails={false}
/>
```

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `connectionState` | `ConnectionState` | Estado de conexión |
| `dataSource` | `DataSource` | Fuente de datos actual |
| `onRetry` | `() => void` | Callback para reintentar |
| `showDetails` | `boolean` | Mostrar detalles expandidos |

**Estados visuales:**

- 🔴 **Sin conexión** - Offline, mostrando caché/default
- 🟡 **Conexión limitada** - Online pero sin Firestore
- 🔵 **Contenido en caché** - Mostrando versión guardada
- ⚪ **Contenido por defecto** - Mostrando datos básicos
- 🟢 **Conectado** - Todo funcionando correctamente

---

## 📄 Datos Por Defecto

Cada página debe tener sus datos por defecto en `src/data/defaults/`.

### **Ejemplo: defaultAbout.ts**

```typescript
import type { AboutData } from '@/types/about.types'

export const defaultAboutData: AboutData = {
    sections: [
        {
            id: 'default-1',
            title: 'Desarrollador Full Stack',
            content: 'Descripción por defecto...',
            image: '/comic-team-web.webp',
            imageAlt: 'Desarrollo web',
            imagePosition: 'right',
        }
    ]
}
```

---

## 🚀 Implementación en Páginas

### **Ejemplo Completo: AboutPage**

```typescript
import { useOfflineData } from '@/hooks/useOfflineData'
import { defaultAboutData } from '@/data/defaults/defaultAbout'
import { getAboutData } from '@/services/aboutService'
import OfflineBanner from '@/components/OfflineBanner'
import SEO from '@/components/SEO'

export default function AboutPage() {
    const {
        data,
        loading,
        error,
        source,
        connectionState,
        refetch
    } = useOfflineData({
        key: 'about-data',
        fetchFn: getAboutData,
        defaultData: defaultAboutData,
        cacheTTL: 24 * 60 * 60 * 1000,
        cacheVersion: '1.0'
    })

    return (
        <>
            {/* SEO */}
            <SEO
                title="Sobre Mí"
                description="Conoce más sobre mi experiencia y habilidades"
                type="profile"
            />

            {/* Banner de estado offline */}
            <OfflineBanner
                connectionState={connectionState}
                dataSource={source}
                onRetry={refetch}
            />

            {/* Contenido */}
            <div className="container mx-auto px-4 py-8">
                {loading ? (
                    <div>Cargando...</div>
                ) : error && source === 'default' ? (
                    <div>
                        <p>Mostrando contenido por defecto</p>
                        {/* Renderizar data */}
                    </div>
                ) : (
                    <div>
                        {/* Renderizar data */}
                    </div>
                )}
            </div>
        </>
    )
}
```

---

## 🧪 Testing

### **Probar Modo Offline**

1. **Abrir DevTools** (F12)
2. **Network tab** → **Throttling** → **Offline**
3. **Recargar la página**
4. Verificar que muestra contenido en caché o por defecto
5. Verificar que aparece el OfflineBanner

### **Probar Reconexión**

1. Poner en modo offline
2. Esperar a que cargue contenido en caché
3. Volver a **Online**
4. Verificar que refetch automáticamente

### **Verificar Caché**

```javascript
// En consola del navegador
localStorage.getItem('app_cache_about-data')
```

---

## 📊 Beneficios

✅ **Disponibilidad 24/7** - Funciona sin internet
✅ **Mejor UX** - Carga instantánea desde caché
✅ **Resiliencia** - Funciona sin Firestore/internet
✅ **SEO** - Contenido siempre disponible
✅ **Performance** - Menos llamadas a API
✅ **Feedback visual** - Usuario sabe el estado
✅ **Versionado** - Control de versiones de caché
✅ **TTL** - Caché no se vuelve obsoleto

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│                    useOfflineData                        │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  1. Verificar Caché   │
              └───────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
            Hay Caché           No Hay Caché
                │                   │
                ▼                   ▼
        ┌──────────────┐    ┌──────────────┐
        │ Usar Caché   │    │ Usar Default │
        │ (rápido)     │    │              │
        └──────────────┘    └──────────────┘
                │                   │
                └─────────┬─────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  2. Intentar Network  │
              └───────────────────────┘
                          │
                ┌─────────┴─────────┐
                │                   │
             Success             Fail
                │                   │
                ▼                   ▼
        ┌──────────────┐    ┌──────────────┐
        │ Actualizar   │    │ Mantener     │
        │ con Network  │    │ Caché/Default│
        │ + Guardar    │    │              │
        └──────────────┘    └──────────────┘
```

---

## 📝 Notas Importantes

1. **localStorage tiene límite** - Aproximadamente 5-10 MB por dominio
2. **Limpiar caché expirado** - Se hace automáticamente al iniciar
3. **Versionado** - Cambiar versión invalida caché anterior
4. **TTL** - Por defecto 24 horas, ajustar según necesidad
5. **Datos sensibles** - No guardar en caché datos sensibles

---

## 🛠️ Mantenimiento

### **Limpiar Caché Manualmente**

```typescript
import { cacheService } from '@/services/cacheService'

// Limpiar todo
cacheService.clearAllCache()

// Limpiar solo expirado
cacheService.clearExpiredCache()

// Ver tamaño
console.log(cacheService.getCacheSizeFormatted())

// Listar claves
console.log(cacheService.listCacheKeys())
```

### **Actualizar Versión de Caché**

Cuando cambies la estructura de datos, incrementa la versión:

```typescript
// Antes: version: '1.0'
// Después: version: '1.1'

useOfflineData({
    key: 'about-data',
    cacheVersion: '1.1', // Nueva versión
    // ...
})
```

---

**Estado**: ✅ Sistema completamente funcional

**Última actualización**: 14 de octubre de 2025
