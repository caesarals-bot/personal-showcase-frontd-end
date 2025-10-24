# 📋 Propuesta de Testing para Sistema de Autenticación

## 🎯 Objetivo

Establecer una estrategia de testing completa para el sistema de autenticación del proyecto, cubriendo tanto el modo desarrollo (mock) como el modo producción (Firebase), garantizando la calidad, seguridad y confiabilidad del sistema.

---

## 📊 Análisis del Sistema Actual

### Componentes Identificados

#### 1. **Hooks**
- `useAuth.ts` - Hook principal de autenticación
  - Gestión de estado de usuario
  - Integración con Firebase Auth
  - Modo desarrollo con localStorage
  - Verificación de estado activo del usuario
  - Funciones: login, logout, register, loginWithGoogle, resendVerificationEmail, checkEmailVerified, reloadUser

#### 2. **Servicios**
- `authService.ts` - Lógica de autenticación
  - Login con email/password
  - Login con Google
  - Registro de usuarios
  - Recuperación de contraseña
  - Verificación de email
  - Manejo de usuarios inactivos
  - Modo desarrollo (DEV_MODE)
  
- `userService.ts` - Gestión de usuarios
  - CRUD de usuarios en Firestore
  - Obtención de usuario por ID
  - Actualización de perfiles
  
- `roleService.ts` - Gestión de roles
  - Determinación de roles (admin/user/guest)
  - Lista de emails administradores
  - Creación de documentos de usuario

#### 3. **Context**
- `AuthContext.tsx` - Proveedor de contexto
  - Wrapper del hook useAuth
  - Notificación de usuarios inactivos
  - Gestión de errores

#### 4. **Componentes UI**
- `LoginForm.tsx` - Formulario de login
  - Validación con Zod
  - Integración con reCAPTCHA
  - Login con Google
  - Verificación de email
  - Prevención de navegación hacia atrás
  
- `RegisterForm.tsx` - Formulario de registro
- `ResetPasswordForm.tsx` - Recuperación de contraseña

#### 5. **Tipos**
- `blog.types.ts` - Definiciones TypeScript
  - User interface
  - AuthState interface

---

## 🧪 Estrategia de Testing

### 1. Testing Framework y Herramientas Recomendadas

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/user-event": "^14.5.1",
    "@testing-library/react-hooks": "^8.0.1",
    "vitest": "^1.0.4",
    "jsdom": "^23.0.1",
    "@vitest/ui": "^1.0.4",
    "msw": "^2.0.11",
    "firebase-mock": "^2.3.2",
    "@faker-js/faker": "^8.3.1"
  }
}
```

**Justificación:**
- **Vitest**: Rápido, compatible con Vite, sintaxis similar a Jest
- **Testing Library**: Best practices para testing de React
- **MSW (Mock Service Worker)**: Interceptar peticiones HTTP/Firebase
- **firebase-mock**: Simular Firebase sin conexión real

---

## 📝 Plan de Testing Detallado

### Nivel 1: Unit Tests (Servicios)

#### 1.1 `authService.ts`

**Casos de prueba:**

##### Login con Email/Password
```typescript
describe('authService - loginUser', () => {
  // Modo Desarrollo
  test('debe iniciar sesión exitosamente en modo desarrollo', async () => {})
  test('debe retornar usuario desde localStorage si existe', async () => {})
  test('debe crear nuevo usuario mock si no existe en localStorage', async () => {})
  test('debe lanzar error si usuario está inactivo en modo desarrollo', async () => {})
  test('debe asignar rol admin correctamente en modo desarrollo', async () => {})
  
  // Modo Producción (Firebase)
  test('debe iniciar sesión con Firebase exitosamente', async () => {})
  test('debe verificar estado isActive del usuario en Firestore', async () => {})
  test('debe cerrar sesión si usuario está inactivo', async () => {})
  test('debe manejar error de credenciales inválidas', async () => {})
  test('debe manejar error de email no verificado', async () => {})
  test('debe manejar error de operación no permitida', async () => {})
  test('debe asignar rol correcto desde Firestore', async () => {})
})
```

##### Login con Google
```typescript
describe('authService - loginWithGoogle', () => {
  test('debe iniciar sesión con Google exitosamente', async () => {})
  test('debe crear documento de usuario si no existe', async () => {})
  test('debe manejar popup cerrado por usuario', async () => {})
  test('debe manejar error de red', async () => {})
  test('debe verificar estado isActive después del login', async () => {})
})
```

##### Registro
```typescript
describe('authService - registerUser', () => {
  test('debe registrar usuario exitosamente', async () => {})
  test('debe crear documento en Firestore', async () => {})
  test('debe enviar email de verificación', async () => {})
  test('debe manejar email ya registrado', async () => {})
  test('debe manejar contraseña débil', async () => {})
  test('debe asignar rol user por defecto', async () => {})
  test('debe asignar rol admin si email está en lista', async () => {})
})
```

##### Logout
```typescript
describe('authService - logoutUser', () => {
  test('debe cerrar sesión exitosamente', async () => {})
  test('debe limpiar localStorage en modo desarrollo', async () => {})
  test('debe cerrar sesión de Firebase en producción', async () => {})
})
```

##### Recuperación de Contraseña
```typescript
describe('authService - resetPassword', () => {
  test('debe enviar email de recuperación exitosamente', async () => {})
  test('debe manejar email no registrado', async () => {})
  test('debe manejar error de red', async () => {})
})
```

##### Verificación de Email
```typescript
describe('authService - Email Verification', () => {
  test('debe reenviar email de verificación', async () => {})
  test('debe lanzar error si no hay usuario autenticado', async () => {})
  test('debe lanzar error si email ya está verificado', async () => {})
  test('debe verificar correctamente el estado de verificación', async () => {})
  test('debe recargar información del usuario', async () => {})
})
```

#### 1.2 `userService.ts`

```typescript
describe('userService', () => {
  describe('getUserById', () => {
    test('debe obtener usuario por ID en modo mock', async () => {})
    test('debe obtener usuario por ID desde Firestore', async () => {})
    test('debe retornar null si usuario no existe', async () => {})
    test('debe manejar error de Firestore', async () => {})
  })
  
  describe('createUser', () => {
    test('debe crear usuario en Firestore', async () => {})
    test('debe validar datos requeridos', async () => {})
    test('debe manejar error de duplicado', async () => {})
  })
  
  describe('updateUser', () => {
    test('debe actualizar usuario exitosamente', async () => {})
    test('debe validar campos actualizables', async () => {})
    test('debe manejar usuario no encontrado', async () => {})
  })
})
```

#### 1.3 `roleService.ts`

```typescript
describe('roleService', () => {
  describe('getUserRole', () => {
    test('debe obtener rol desde Firestore', async () => {})
    test('debe retornar "user" por defecto si no existe', async () => {})
    test('debe manejar timeout de 3 segundos', async () => {})
    test('debe retornar "user" en caso de error CORS', async () => {})
  })
  
  describe('shouldBeAdmin', () => {
    test('debe retornar true para emails en lista de admins', () => {})
    test('debe retornar false para emails no admin', () => {})
    test('debe ser case-insensitive', () => {})
  })
  
  describe('createUserDocument', () => {
    test('debe crear documento con rol especificado', async () => {})
    test('debe usar rol "user" por defecto', async () => {})
    test('debe incluir isActive: true', async () => {})
    test('debe incluir timestamp de creación', async () => {})
  })
})
```

---

### Nivel 2: Integration Tests (Hooks)

#### 2.1 `useAuth.ts`

```typescript
describe('useAuth Hook', () => {
  describe('Inicialización', () => {
    test('debe cargar usuario desde localStorage en modo desarrollo', async () => {})
    test('debe crear usuario admin por defecto si no existe', async () => {})
    test('debe suscribirse a cambios de Firebase en producción', async () => {})
    test('debe establecer isLoading en false después de cargar', async () => {})
  })
  
  describe('Login', () => {
    test('debe actualizar estado después de login exitoso', async () => {})
    test('debe establecer error en caso de fallo', async () => {})
    test('debe establecer isLoading durante el proceso', async () => {})
    test('debe limpiar error anterior al intentar nuevo login', async () => {})
  })
  
  describe('Logout', () => {
    test('debe limpiar estado de usuario', async () => {})
    test('debe limpiar errores', async () => {})
    test('debe manejar error de logout', async () => {})
  })
  
  describe('Register', () => {
    test('debe actualizar estado con nuevo usuario', async () => {})
    test('debe manejar error de registro', async () => {})
  })
  
  describe('Verificación de Usuario Activo', () => {
    test('debe verificar estado cada 30 segundos', async () => {})
    test('debe cerrar sesión si usuario está inactivo', async () => {})
    test('debe establecer mensaje de error apropiado', async () => {})
    test('no debe verificar en modo desarrollo', async () => {})
  })
  
  describe('Funciones Auxiliares', () => {
    test('clearError debe limpiar el error', () => {})
    test('checkEmailVerified debe retornar estado correcto', () => {})
    test('reloadUser debe actualizar información del usuario', async () => {})
  })
})
```

---

### Nivel 3: Component Tests (UI)

#### 3.1 `LoginForm.tsx`

```typescript
describe('LoginForm Component', () => {
  describe('Renderizado', () => {
    test('debe renderizar todos los campos del formulario', () => {})
    test('debe renderizar botón de Google', () => {})
    test('debe renderizar reCAPTCHA', () => {})
    test('debe renderizar link de registro', () => {})
    test('debe renderizar link de recuperación de contraseña', () => {})
  })
  
  describe('Validación', () => {
    test('debe mostrar error si email es inválido', async () => {})
    test('debe mostrar error si contraseña es muy corta', async () => {})
    test('debe mostrar error si contraseña no tiene mayúscula', async () => {})
    test('debe mostrar error si contraseña no tiene número', async () => {})
    test('debe mostrar error si reCAPTCHA no está completado', async () => {})
  })
  
  describe('Interacción', () => {
    test('debe habilitar botón solo si reCAPTCHA está completado', async () => {})
    test('debe deshabilitar botón durante carga', async () => {})
    test('debe llamar loginUser con datos correctos', async () => {})
    test('debe mostrar spinner durante login', async () => {})
    test('debe navegar después de login exitoso', async () => {})
    test('debe mostrar error si login falla', async () => {})
    test('debe resetear reCAPTCHA después de error', async () => {})
  })
  
  describe('Login con Google', () => {
    test('debe llamar loginWithGoogle al hacer click', async () => {})
    test('debe validar reCAPTCHA antes de login con Google', async () => {})
    test('debe navegar después de login exitoso', async () => {})
  })
  
  describe('Verificación de Email', () => {
    test('debe mostrar error si email no está verificado', async () => {})
    test('debe permitir login si email está verificado', async () => {})
  })
  
  describe('Navegación', () => {
    test('debe prevenir navegación hacia atrás después de login', async () => {})
    test('debe redirigir a página de origen después de login', async () => {})
    test('debe redirigir a home si no hay página de origen', async () => {})
  })
})
```

#### 3.2 `AuthContext.tsx`

```typescript
describe('AuthContext', () => {
  test('debe proveer valores de autenticación a componentes hijos', () => {})
  test('debe lanzar error si se usa fuera del provider', () => {})
  test('debe mostrar notificación si usuario está inactivo', () => {})
  test('debe limpiar error al cerrar notificación', () => {})
})
```

---

### Nivel 4: E2E Tests (Flujos Completos)

```typescript
describe('E2E - Flujo de Autenticación', () => {
  describe('Registro y Login', () => {
    test('debe registrar usuario, verificar email y hacer login', async () => {
      // 1. Ir a página de registro
      // 2. Completar formulario
      // 3. Completar reCAPTCHA
      // 4. Enviar formulario
      // 5. Verificar email (simular)
      // 6. Ir a login
      // 7. Iniciar sesión
      // 8. Verificar redirección
    })
  })
  
  describe('Login con Google', () => {
    test('debe hacer login con Google exitosamente', async () => {})
  })
  
  describe('Recuperación de Contraseña', () => {
    test('debe enviar email de recuperación', async () => {})
    test('debe permitir cambiar contraseña', async () => {})
  })
  
  describe('Sesión Persistente', () => {
    test('debe mantener sesión después de recargar página', async () => {})
    test('debe cerrar sesión correctamente', async () => {})
  })
  
  describe('Usuario Inactivo', () => {
    test('debe cerrar sesión automáticamente si usuario se desactiva', async () => {})
    test('debe mostrar notificación apropiada', async () => {})
  })
  
  describe('Roles y Permisos', () => {
    test('debe asignar rol admin a emails autorizados', async () => {})
    test('debe asignar rol user por defecto', async () => {})
  })
})
```

---

## 🔧 Configuración de Testing

### 1. Archivo `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'src/test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'dist/'
      ]
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### 2. Archivo `src/test/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { afterEach, vi } from 'vitest'

// Cleanup después de cada test
afterEach(() => {
  cleanup()
  localStorage.clear()
  sessionStorage.clear()
})

// Mock de Firebase
vi.mock('../firebase/config', () => ({
  auth: {
    currentUser: null,
    onAuthStateChanged: vi.fn(),
    signInWithEmailAndPassword: vi.fn(),
    signOut: vi.fn(),
  },
  db: {},
}))

// Mock de reCAPTCHA
global.grecaptcha = {
  ready: vi.fn((cb) => cb()),
  execute: vi.fn(() => Promise.resolve('mock-token')),
  render: vi.fn(),
  reset: vi.fn(),
}
```

### 3. Estructura de Carpetas

```
src/
├── test/
│   ├── setup.ts
│   ├── utils/
│   │   ├── test-utils.tsx          # Wrappers y helpers
│   │   ├── mock-data.ts            # Datos de prueba
│   │   └── firebase-mocks.ts       # Mocks de Firebase
│   ├── unit/
│   │   ├── services/
│   │   │   ├── authService.test.ts
│   │   │   ├── userService.test.ts
│   │   │   └── roleService.test.ts
│   ├── integration/
│   │   └── hooks/
│   │       └── useAuth.test.ts
│   ├── component/
│   │   ├── LoginForm.test.tsx
│   │   ├── RegisterForm.test.tsx
│   │   └── AuthContext.test.tsx
│   └── e2e/
│       └── auth-flow.test.tsx
```

---

## 📊 Métricas de Cobertura Objetivo

| Categoría | Objetivo Mínimo | Objetivo Ideal |
|-----------|----------------|----------------|
| **Servicios** | 85% | 95% |
| **Hooks** | 80% | 90% |
| **Componentes** | 75% | 85% |
| **E2E** | 60% | 75% |
| **Global** | 80% | 90% |

---

## 🎯 Casos de Prueba Críticos (Prioridad Alta)

### 1. Seguridad
- ✅ Validación de credenciales
- ✅ Manejo de tokens
- ✅ Protección contra inyección
- ✅ Verificación de email
- ✅ Usuarios inactivos

### 2. Funcionalidad Core
- ✅ Login con email/password
- ✅ Login con Google
- ✅ Registro de usuarios
- ✅ Logout
- ✅ Recuperación de contraseña

### 3. Estados Edge Cases
- ✅ Usuario inactivo durante sesión
- ✅ Email no verificado
- ✅ Timeout de Firebase
- ✅ Errores de red
- ✅ Modo desarrollo vs producción

---

## 🔄 Flujo de Testing en CI/CD

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
      
      - name: Run component tests
        run: npm run test:component
      
      - name: Generate coverage report
        run: npm run test:coverage
      
      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
```

---

## 📝 Scripts de Testing Recomendados

```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:unit": "vitest run src/test/unit",
    "test:integration": "vitest run src/test/integration",
    "test:component": "vitest run src/test/component",
    "test:e2e": "vitest run src/test/e2e",
    "test:coverage": "vitest run --coverage",
    "test:watch": "vitest watch"
  }
}
```

---

## 🚀 Plan de Implementación

### Fase 1: Setup (1-2 días)
- [ ] Instalar dependencias de testing
- [ ] Configurar Vitest
- [ ] Crear estructura de carpetas
- [ ] Configurar mocks de Firebase
- [ ] Crear utilities de testing

### Fase 2: Unit Tests (3-4 días)
- [ ] Tests de authService.ts
- [ ] Tests de userService.ts
- [ ] Tests de roleService.ts

### Fase 3: Integration Tests (2-3 días)
- [ ] Tests de useAuth hook
- [ ] Tests de interacción entre servicios

### Fase 4: Component Tests (3-4 días)
- [ ] Tests de LoginForm
- [ ] Tests de RegisterForm
- [ ] Tests de AuthContext
- [ ] Tests de otros componentes de auth

### Fase 5: E2E Tests (2-3 días)
- [ ] Flujos completos de autenticación
- [ ] Casos edge cases
- [ ] Pruebas de roles y permisos

### Fase 6: CI/CD y Documentación (1-2 días)
- [ ] Configurar GitHub Actions
- [ ] Documentar proceso de testing
- [ ] Establecer métricas de cobertura
- [ ] Code review y ajustes

**Tiempo Total Estimado:** 12-18 días

---

## 🎓 Mejores Prácticas

### 1. Naming Conventions
```typescript
// ✅ Bueno
test('debe iniciar sesión exitosamente con credenciales válidas', async () => {})

// ❌ Malo
test('login test', async () => {})
```

### 2. Arrange-Act-Assert Pattern
```typescript
test('debe actualizar estado después de login', async () => {
  // Arrange
  const mockUser = { email: 'test@test.com', password: '12345678' }
  
  // Act
  const result = await loginUser(mockUser.email, mockUser.password)
  
  // Assert
  expect(result).toBeDefined()
  expect(result.email).toBe(mockUser.email)
})
```

### 3. Mocking Estratégico
```typescript
// Mock solo lo necesario
vi.mock('../services/authService', () => ({
  loginUser: vi.fn(),
  // No mockear todo si no es necesario
}))
```

### 4. Cleanup
```typescript
afterEach(() => {
  vi.clearAllMocks()
  cleanup()
  localStorage.clear()
})
```

---

## 📚 Recursos y Referencias

### Documentación
- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Firebase Testing](https://firebase.google.com/docs/rules/unit-tests)
- [MSW Documentation](https://mswjs.io/)

### Ejemplos de Tests
- Incluir ejemplos completos en `src/test/examples/`
- Documentar patrones comunes
- Crear templates reutilizables

---

## ✅ Checklist de Calidad

Antes de considerar el testing completo, verificar:

- [ ] Cobertura mínima del 80% alcanzada
- [ ] Todos los casos críticos cubiertos
- [ ] Tests pasan en modo desarrollo y producción
- [ ] CI/CD configurado y funcionando
- [ ] Documentación actualizada
- [ ] Code review completado
- [ ] Performance de tests aceptable (<30s total)
- [ ] No hay tests flaky (intermitentes)
- [ ] Mocks bien configurados
- [ ] Edge cases cubiertos

---

## 🔮 Futuras Mejoras

### Testing Avanzado
- [ ] Visual regression testing
- [ ] Performance testing
- [ ] Security testing automatizado
- [ ] Accessibility testing
- [ ] Load testing para Firebase

### Herramientas Adicionales
- [ ] Playwright para E2E más robustos
- [ ] Storybook para component testing
- [ ] Chromatic para visual testing
- [ ] SonarQube para análisis de código

---

## 📞 Contacto y Soporte

Para dudas o sugerencias sobre esta propuesta:
- Email: caesarals@gmail.com
- Documentación: Ver README.md del proyecto

---

**Última actualización:** Octubre 24, 2025
**Versión:** 1.0
**Autor:** César Alvarado
