# 🏗️ Arquitectura del Proyecto

## Visión General

Este proyecto sigue una **arquitectura modular** inspirada en principios de Clean Architecture y Domain-Driven Design, adaptada para aplicaciones React modernas.

## Principios de Diseño

### 🎯 **Separación de Responsabilidades**
- **Data Layer**: Gestión centralizada de datos
- **Service Layer**: Lógica de negocio y comunicación externa
- **Presentation Layer**: Componentes UI y lógica de presentación
- **Hook Layer**: Estado y efectos reutilizables

### 🔄 **Flujo de Datos**
```
UI Components → Hooks → Services → Data Sources
     ↑                                    ↓
     ←────────── State Updates ←──────────
```

## Estructura Detallada

### 📁 **`/src/data/`** - Capa de Datos
Almacena datos estáticos y configuraciones centralizadas.

```typescript
// Ejemplo: contact.data.ts
export const contactData: ContactData = {
  contactInfo: {
    email: 'cesar@ejemplo.com',
    socialLinks: [...]
  }
}
```

**Propósito**: 
- Centralizar datos de configuración
- Facilitar migración futura a Firebase
- Mantener consistencia de datos

### 🔧 **`/src/services/`** - Capa de Servicios
Abstrae la lógica de obtención y manipulación de datos.

```typescript
// Ejemplo: contactService.ts
export class ContactService {
  static async getContactData(): Promise<ContactData> {
    // Simula delay de red
    await new Promise(resolve => setTimeout(resolve, 200))
    return contactData
  }
  
  // Preparado para Firebase
  // static async getContactDataFromFirebase() { ... }
}
```

**Beneficios**:
- Abstracción de fuentes de datos
- Fácil testing y mocking
- Preparación para APIs externas

### 🎣 **`/src/hooks/`** - Capa de Estado
Hooks personalizados que encapsulan lógica de estado y efectos.

```typescript
// Ejemplo: useContactData.ts
export function useContactData() {
  const [data, setData] = useState<ContactData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await ContactService.getContactData()
        setData(result)
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  return { data, loading, error }
}
```

**Ventajas**:
- Reutilización de lógica de estado
- Separación de concerns
- Testing simplificado

### 🧩 **`/src/shared/components/`** - Componentes Compartidos
Componentes reutilizables sin lógica de negocio específica.

```typescript
// Ejemplo: ContactInfo.tsx
export default function ContactInfo({
  position = 'top-left',
  showSocials = true,
  variant = 'floating'
}: ContactInfoProps) {
  const { data, loading, error } = useContactData()
  
  // Lógica de renderizado...
}
```

### 📄 **`/src/pages/`** - Páginas y Layouts
Componentes de página que orquestan la funcionalidad completa.

```typescript
// Ejemplo: AboutPage.tsx
export default function AboutPage() {
  const { data: aboutData } = useAboutData()
  const { data: timelineData } = useTimelineData()
  
  // Composición de componentes...
}
```

## Patrones de Diseño Implementados

### 🏭 **Service Layer Pattern**
- Encapsula lógica de acceso a datos
- Proporciona interfaz consistente
- Facilita testing y mocking

### 🎣 **Custom Hooks Pattern**
- Encapsula lógica de estado reutilizable
- Separa lógica de presentación
- Facilita testing de lógica de negocio

### 🏗️ **Composition Pattern**
- Componentes pequeños y enfocados
- Reutilización mediante composición
- Flexibilidad en el diseño

### 📦 **Data Transfer Object (DTO)**
- Tipos TypeScript bien definidos
- Validación de datos en tiempo de compilación
- Documentación implícita de contratos

## Gestión de Estado

### 🔄 **Estado Local vs Global**
- **Local**: `useState`, `useReducer` para estado de componente
- **Compartido**: Custom hooks para estado reutilizable
- **Futuro**: Context API o Zustand para estado global complejo

### 📊 **Flujo de Datos**
1. **Componente** solicita datos via hook
2. **Hook** llama al servicio correspondiente
3. **Servicio** obtiene datos de la fuente
4. **Hook** actualiza estado y notifica componente
5. **Componente** re-renderiza con nuevos datos

## Preparación para Escalabilidad

### 🔥 **Integración Firebase**
```typescript
// Estructura preparada para Firebase
export class ContactService {
  // Método actual (datos locales)
  static async getContactData(): Promise<ContactData> {
    return contactData
  }

  // Método futuro (Firebase)
  static async getContactDataFromFirebase(): Promise<ContactData> {
    const docRef = doc(db, 'personal', 'contact')
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return docSnap.data() as ContactData
    }
    throw new Error('No se encontraron datos')
  }
}
```

### 🧪 **Testing Strategy**
- **Unit Tests**: Servicios y hooks aislados
- **Integration Tests**: Flujo completo de datos
- **Component Tests**: Renderizado y interacciones

### 📈 **Performance**
- **Code Splitting**: Lazy loading de páginas
- **Memoization**: React.memo para componentes pesados
- **Optimistic Updates**: Para mejor UX

## Convenciones de Código

### 📝 **Nomenclatura**
- **Componentes**: PascalCase (`ContactInfo`)
- **Hooks**: camelCase con prefijo `use` (`useContactData`)
- **Servicios**: PascalCase con sufijo `Service` (`ContactService`)
- **Tipos**: PascalCase con sufijo descriptivo (`ContactData`)

### 📁 **Organización de Archivos**
- **Co-location**: Archivos relacionados juntos
- **Barrel Exports**: `index.ts` para exportaciones limpias
- **Separación por dominio**: Agrupación lógica de funcionalidad

### 🎨 **Estilos**
- **Tailwind CSS**: Utility-first approach
- **Component Variants**: shadcn/ui para consistencia
- **Responsive Design**: Mobile-first approach

## Beneficios de esta Arquitectura

### ✅ **Mantenibilidad**
- Código organizado y predecible
- Fácil localización de funcionalidad
- Cambios aislados y controlados

### ✅ **Testabilidad**
- Componentes y lógica separados
- Mocking simplificado de dependencias
- Testing de unidades pequeñas

### ✅ **Escalabilidad**
- Estructura preparada para crecimiento
- Patrones consistentes
- Fácil adición de nuevas funcionalidades

### ✅ **Reutilización**
- Componentes modulares
- Hooks reutilizables
- Servicios compartidos

---

Esta arquitectura proporciona una base sólida para el crecimiento del proyecto manteniendo la simplicidad y claridad del código.
