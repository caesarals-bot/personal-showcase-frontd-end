# 📅 Plan de Trabajo - 16 de Octubre 2025

## 🎯 Objetivos Principales
1. Corregir bugs críticos identificados en testing
2. Completar integración Firebase (Profile/Timeline/Usuarios)
3. Implementar sistema de colaboradores
4. Portfolio 3D Cards (si hay tiempo)

## 🚨 PENDIENTES CRÍTICOS (Identificados en Testing)

### **Bugs Encontrados**:
1. 🔴 **Crear Post** - No se ven todos los tags/categorías
2. 🟡 **Timeline** - No conectado a Firebase (colección no existe)
3. 🟡 **About/Profile** - No conectado a Firebase (colección no existe)
4. 🟡 **Usuarios Admin** - No carga desde Firebase
5. 🟡 **Contacto** - Info hardcoded, debería venir de profile
6. 🟡 **Colaboradores** - Falta sistema de revisión de posts
7. 🟢 **Comentarios** - Sistema no implementado
8. 🟢 **Likes** - No persiste en Firebase
9. 🟢 **Notificaciones** - Email cuando envían mensaje

---

## ⏰ Cronograma ACTUALIZADO (7-8 horas)

### **Sesión 1: Fixes Críticos** (2 horas) 🔴

#### **09:00 - 09:30** | Fix Crear Post - Tags/Categorías (30 min)
**Problema**: Al crear post no se muestran todas las categorías/tags disponibles

**Solución**:
- [ ] Modificar `CreatePostPage.tsx` o `EditPostPage.tsx`
- [ ] Cargar TODAS las categorías con `getCategories()`
- [ ] Cargar TODOS los tags con `getTags()`
- [ ] No filtrar por posts existentes
- [ ] Testing: Verificar que se muestren todos

```typescript
// src/admin/pages/CreatePostPage.tsx
useEffect(() => {
  const loadData = async () => {
    const [allCategories, allTags] = await Promise.all([
      getCategories(), // ✅ TODAS las categorías
      getTags()        // ✅ TODOS los tags
    ]);
    setCategories(allCategories);
    setTags(allTags);
  };
  loadData();
}, []);
```

#### **09:30 - 10:30** | Timeline a Firebase (1 hora)

**Problema**: Colección `timeline` no existe, datos hardcoded

**Pasos**:
- [ ] Crear colección `timeline` en Firestore Console
- [ ] Crear `src/services/timelineService.ts`
  ```typescript
  export async function getTimelineItems(): Promise<TimelineItem[]>
  export async function createTimelineItem(data): Promise<string>
  export async function updateTimelineItem(id, data): Promise<void>
  export async function deleteTimelineItem(id): Promise<void>
  ```
- [ ] Migrar datos actuales a Firestore (manual)
- [ ] Conectar `TimelinePage` (admin) a Firebase
- [ ] Conectar `AboutPage` (frontend) a Firebase
- [ ] Testing: CRUD completo

**Estructura de documento**:
```javascript
timeline/{itemId}
{
  type: "education" | "experience" | "certification",
  title: string,
  institution: string,
  startDate: timestamp,
  endDate: timestamp | null,
  isCurrent: boolean,
  description: string,
  tags: string[],
  order: number
}
```

#### **10:30 - 11:00** | Contacto Dinámico (30 min)

**Problema**: Email/teléfono hardcoded, debería venir de profile

**Pasos**:
- [ ] Agregar campos de contacto a `profile/about`
  ```javascript
  contact: {
    email: string,
    phone: string,
    whatsapp: string
  }
  ```
- [ ] Actualizar `ContactMePage.tsx` para cargar desde Firebase
- [ ] Actualizar `ProfilePage` (admin) para editar contacto
- [ ] Testing: Verificar que se actualice dinámicamente

---

### **Sesión 2: Profile y Usuarios** (1.5 horas) 🔥

#### **11:00 - 11:45** | Profile/About a Firebase (45 min)

**Problema**: Colección `profile` no existe, datos hardcoded

**Pasos**:
- [ ] Crear documento `profile/about` en Firestore
- [ ] Crear `src/services/profileService.ts`
  ```typescript
  export async function getProfile(): Promise<Profile | null>
  export async function updateProfile(data: Partial<Profile>): Promise<void>
  ```
- [ ] Migrar datos actuales (bio, skills, etc.)
- [ ] Conectar `ProfilePage` (admin) a Firebase
- [ ] Conectar `AboutPage` (frontend) a Firebase
- [ ] Testing: Editar y ver cambios

**Estructura**:
```javascript
profile/about
{
  fullName: string,
  title: string,
  bio: string,
  email: string,
  phone: string,
  location: string,
  skills: string[],
  languages: [{name: string, level: string}],
  contact: {email, phone, whatsapp},
  social: {github, linkedin, twitter}
}
```

#### **11:45 - 12:30** | Usuarios desde Firebase (45 min)

**Problema**: `UsersPage` usa datos mock, no carga desde Firestore

**Pasos**:
- [ ] Modificar `src/admin/pages/UsersPage.tsx`
- [ ] Cargar usuarios desde Firestore
  ```typescript
  const usersRef = collection(db, 'users');
  const snapshot = await getDocs(usersRef);
  ```
- [ ] Implementar cambio de rol (admin/collaborator/user)
- [ ] Implementar activar/desactivar usuario
- [ ] Testing: Verificar que se vean usuarios reales

---

### **Sesión 3: Sistema de Colaboradores** (2 horas) 👥

#### **12:30 - 13:00** | Roles y Estados (30 min)

**Objetivo**: Permitir que colaboradores creen posts en estado "pending_review"

**Pasos**:
- [ ] Agregar tipo de rol en `user.types.ts`
  ```typescript
  export type UserRole = 'admin' | 'collaborator' | 'user';
  ```
- [ ] Agregar estado en `blog.types.ts`
  ```typescript
  export type PostStatus = 'draft' | 'pending_review' | 'published' | 'archived';
  ```
- [ ] Actualizar Firestore rules
  ```javascript
  // Colaboradores pueden crear posts pending_review
  allow create: if isAuthenticated() && 
    (request.resource.data.status == 'pending_review' || isAdmin());
  ```

#### **13:00 - 14:00** | Página de Revisión (1 hora)

- [ ] Crear `src/admin/pages/PendingPostsPage.tsx`
- [ ] Listar posts con status "pending_review"
- [ ] Botones: Aprobar / Rechazar / Editar
- [ ] Al aprobar: cambiar status a "published"
- [ ] Al rechazar: agregar comentario de rechazo
- [ ] Agregar ruta en router admin
- [ ] Testing: Crear post como collaborator y aprobar como admin

#### **14:00 - 14:30** | Notificaciones (30 min)

- [ ] Crear componente `PendingApproval` badge
- [ ] Mostrar contador en sidebar admin
- [ ] Actualizar en tiempo real (opcional)
- [ ] Testing completo del flujo
    languages: [{name: "Español", level: "Nativo"}],
    interests: ["Desarrollo web", ...]
  }
  ```
- [ ] Crear documentos en colección `timeline`
  - Educación (tipo: "education")
  - Experiencia (tipo: "experience")
  - Certificaciones (tipo: "certification")
- [ ] Verificar datos en Firebase Console

#### **12:00 - 12:30** | Actualizar AboutPage (30 min)
- [ ] Modificar `src/pages/about/AboutPage.tsx`
- [ ] Usar `getProfile()` y `getTimelineItems()`
- [ ] Filtrar timeline por tipo
- [ ] Agregar loading states
- [ ] Testing completo

---

### **Sesión 3: Testing & Deploy** (30 min) 🧪

#### **12:30 - 13:00** | Testing Completo
- [ ] **Performance**
  - Verificar tiempo de carga del blog (~800ms)
  - Verificar caché funcionando (segunda carga ~50ms)
  - Verificar lazy loading en DevTools Network
  
- [ ] **Funcionalidad**
  - Logout redirige correctamente
  - Posts se actualizan (Borrador ↔ Publicado)
  - Imágenes se muestran con fallback
  - Portfolio 3D cards funcionan
  - About carga desde Firebase
  
- [ ] **Responsive**
  - Mobile: Cards se ven bien
  - Tablet: Grid adaptativo
  - Desktop: Efectos 3D suaves
  
- [ ] **Cross-browser**
  - Chrome ✓
  - Firefox ✓
  - Safari ✓

---

### **Sesión 4: Deploy Final** (30 min) 🚀

#### **13:00 - 13:30** | Build & Deploy
- [ ] Build del proyecto
  ```bash
  npm run build
  ```
- [ ] Verificar que no hay errores
- [ ] Commit de cambios
  ```bash
  git add .
  git commit -m "feat: Portfolio 3D cards + Firebase integration + Performance optimizations"
  ```
- [ ] Push a repositorio
  ```bash
  git push origin main
  ```
- [ ] Verificar deploy automático en Netlify
- [ ] Testing en producción

---

## 📋 Checklist Completo

### **Portfolio 3D Cards**
- [ ] Animaciones CSS agregadas
- [ ] Tipos TypeScript creados
- [ ] Componente ProjectCard implementado
- [ ] Datos de proyectos creados
- [ ] Imágenes preparadas
- [ ] PortfolioPage actualizada
- [ ] Testing visual completo
- [ ] Responsive verificado

### **Firebase Integration**
- [ ] profileService.ts creado
- [ ] timelineService.ts creado
- [ ] Documento profile/about en Firestore
- [ ] Documentos timeline en Firestore
- [ ] AboutPage actualizada
- [ ] Loading states implementados
- [ ] Testing de servicios

### **Testing & QA**
- [ ] Performance verificado
- [ ] Funcionalidad completa
- [ ] Responsive en 3 breakpoints
- [ ] Cross-browser testing
- [ ] No hay console errors
- [ ] Lighthouse score > 90

### **Deploy**
- [ ] Build exitoso
- [ ] Commit descriptivo
- [ ] Push a repositorio
- [ ] Deploy en Netlify
- [ ] Testing en producción
- [ ] Documentación actualizada

---

## 🎨 Efectos a Verificar en Portfolio

### **Interacciones con Mouse**
- [ ] Card rota en 3D al mover el mouse
- [ ] Imagen hace parallax
- [ ] Spotlight sigue al mouse
- [ ] Transiciones suaves

### **Animaciones**
- [ ] Borde con gradiente animado
- [ ] LEDs pulsantes en esquinas
- [ ] Línea de escaneo
- [ ] Shine effect en botones
- [ ] Tags con animación escalonada

### **Carousel**
- [ ] Navegación entre imágenes
- [ ] Indicadores de posición
- [ ] Controles aparecen en hover
- [ ] Transiciones suaves

---

## 📊 Métricas Objetivo

### **Performance**
- Blog carga en < 1 segundo ✓
- Caché funciona (< 100ms segunda carga) ✓
- Lazy loading reduce bundle inicial 60%+ ✓
- Portfolio cards 60fps constante 🎯

### **Bundle Size**
- Bundle principal: < 1MB ✓
- Chunks lazy: < 30KB cada uno ✓
- Total gzipped: < 350KB ✓

### **Lighthouse Scores**
- Performance: > 90 🎯
- Accessibility: > 95 🎯
- Best Practices: > 95 🎯
- SEO: > 90 🎯

---

## 🐛 Posibles Problemas y Soluciones

### **Problema 1: Animaciones no funcionan**
**Causa**: Animaciones CSS no agregadas
**Solución**: Verificar que estén en `globals.css` y que Tailwind compile correctamente

### **Problema 2: Efecto 3D muy sensible**
**Causa**: Divisor muy bajo en cálculo de mousePosition
**Solución**: Cambiar de `/20` a `/30` o `/40`

### **Problema 3: Imágenes no cargan**
**Causa**: Rutas incorrectas
**Solución**: Verificar `public/projects/` y usar fallback de Unsplash

### **Problema 4: Firebase no conecta**
**Causa**: Variables de entorno
**Solución**: Verificar `.env` y `VITE_USE_FIREBASE=true`

### **Problema 5: Build falla**
**Causa**: Imports rotos o tipos incorrectos
**Solución**: Verificar todos los imports y tipos TypeScript

---

## 📚 Recursos de Referencia

### **Documentación**
- `PORTFOLIO_3D_CARDS.md` - Guía completa de implementación
- `FIREBASE_SCHEMA.md` - Schema de colecciones
- `SESSION_SUMMARY_OCT15.md` - Resumen del día anterior

### **Archivos de Ejemplo**
- ~~`src/ejemplodecard/pagecardejeplo.tsx`~~ (eliminado, usar documentación)
- ~~`src/ejemplodecard/globalcss.css`~~ (eliminado, usar documentación)
- ~~`src/ejemplodecard/pageEjemplo.tsx`~~ (eliminado, usar documentación)

### **Código de Referencia**
Todo el código necesario está en `PORTFOLIO_3D_CARDS.md`

---

## 🎯 Objetivos de la Sesión

### **Mínimo Viable**
- ✅ Portfolio 3D cards implementadas
- ✅ Al menos 3 proyectos con imágenes
- ✅ Efectos básicos funcionando
- ✅ Responsive

### **Objetivo Completo**
- ✅ Portfolio 3D cards con todos los efectos
- ✅ Firebase integration para profile/timeline
- ✅ AboutPage usando Firebase
- ✅ Testing completo
- ✅ Deploy exitoso

### **Extra (Si hay tiempo)**
- ⭐ Panel admin para gestionar proyectos
- ⭐ Colección `projects` en Firestore
- ⭐ CRUD de proyectos desde admin
- ⭐ Upload de imágenes a Firebase Storage

---

## 📝 Notas Importantes

### **Prioridades**
1. **Alta**: Portfolio 3D cards (impacto visual máximo)
2. **Media**: Firebase integration (mejora arquitectura)
3. **Baja**: Panel admin proyectos (puede ser después)

### **Tiempo Buffer**
- Estimado: 4 horas
- Buffer: +1 hora para imprevistos
- Total: 5 horas máximo

### **Breaks**
- Cada 1 hora: 10 min de descanso
- Almuerzo: 30 min (después de Firebase)

---

## 🚀 Resultado Esperado

### **Al Final del Día**
- ✅ Portfolio con cards 3D impresionantes
- ✅ Efectos visuales funcionando perfectamente
- ✅ About page cargando desde Firebase
- ✅ Timeline con datos reales
- ✅ Performance optimizado
- ✅ Deploy en producción
- ✅ Documentación actualizada

### **Impacto Visual**
**Antes**: Portfolio simple con cards básicas
**Después**: Portfolio profesional con efectos 3D, animaciones y experiencia interactiva de primer nivel

---

## 📞 Contacto y Soporte

Si encuentras problemas:
1. Revisar `PORTFOLIO_3D_CARDS.md` sección Troubleshooting
2. Verificar console de DevTools
3. Revisar Firebase Console
4. Consultar documentación de shadcn/ui

---

**Preparado**: 15 de Octubre, 2025
**Para**: 16 de Octubre, 2025
**Estimado**: 4-5 horas
**Prioridad**: Alta
**Estado**: Listo para comenzar ✅
