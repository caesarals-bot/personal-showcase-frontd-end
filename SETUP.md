# 🔧 Configuración Inicial del Proyecto

## 📋 Pasos para Personalizar tu Portfolio

### 1. **Configurar Datos Personales**

Los archivos de datos personales están excluidos del repositorio por seguridad. Necesitas crear tus propios archivos basándote en los ejemplos:

```bash
# Navegar a la carpeta de datos
cd src/data/

# Copiar archivos de ejemplo
cp contact.data.example.ts contact.data.ts
cp about.data.example.ts about.data.ts
cp timeline.data.example.ts timeline.data.ts
```

### 2. **Personalizar Información de Contacto**

Edita `src/data/contact.data.ts`:

```typescript
export const contactData: ContactData = {
    contactInfo: {
        email: 'tu-email-real@dominio.com',           // ✏️ Tu email real
        phone: '+54 9 11 1234-5678',                 // ✏️ Tu teléfono
        location: 'Tu Ciudad, Tu País',              // ✏️ Tu ubicación
        socialLinks: [
            {
                id: '1',
                name: 'GitHub',
                url: 'https://github.com/tu-usuario-real',    // ✏️ Tu GitHub
                icon: 'github',
                color: '#333',
                isVisible: true
            },
            // ... actualizar todas las redes sociales
        ]
    }
}
```

### 3. **Personalizar Sección "Sobre Mí"**

Edita `src/data/about.data.ts`:

- ✏️ **Títulos**: Cambia los títulos de cada sección
- ✏️ **Contenido**: Escribe tu historia personal y profesional
- ✏️ **Imágenes**: Actualiza las rutas a tus imágenes reales

### 4. **Personalizar Timeline Profesional**

Edita `src/data/timeline.data.ts`:

- ✏️ **Experiencias laborales**: Tus trabajos reales
- ✏️ **Educación**: Tu formación académica
- ✏️ **Certificaciones**: Tus certificaciones profesionales
- ✏️ **Proyectos**: Tus proyectos personales destacados

### 5. **Añadir tus Imágenes**

Coloca tus imágenes en la carpeta `public/`:

```
public/
├── tu-foto-principal.png        # Para HomePage
├── imagen-seccion-1.webp        # Para AboutPage
├── imagen-seccion-2.webp
├── imagen-seccion-3.webp
└── favicon.ico                  # Tu favicon personalizado
```

**Nota**: Las imágenes personales están en `.gitignore` por seguridad.

### 6. **Actualizar Logo**

Edita `src/shared/components/Logo.tsx` para personalizar:

- ✏️ **Nombre**: Cambia "Cesar Londoño" por tu nombre
- ✏️ **Estilo**: Ajusta colores, fuentes o diseño
- ✏️ **SVG**: Reemplaza con tu logo personalizado

### 7. **Personalizar Textos Dinámicos**

En `src/pages/home/HomePage.tsx`, actualiza los textos que se alternan:

```typescript
const texts = useMemo(() => [
    'Tu Rol Principal',           // ✏️ Ej: "Full Stack Developer"
    'Tu Rol Secundario',         // ✏️ Ej: "UI/UX Designer"
], [])
```

## 🎨 Personalización Visual

### **Colores y Tema**

Los colores principales se definen en `src/index.css`. Puedes personalizar:

- ✏️ **Colores primarios**: Variables CSS `--primary`, `--secondary`
- ✏️ **Modo oscuro**: Variables para `dark` mode
- ✏️ **Acentos**: Colores de hover, bordes, etc.

### **Tipografía**

Para cambiar las fuentes:

1. **Google Fonts**: Actualiza el `<link>` en `index.html`
2. **CSS**: Modifica las clases en `src/index.css`
3. **Componentes**: Actualiza las clases `oswald` por tu fuente

## 🔒 Seguridad y Privacidad

### **Archivos Protegidos**

Estos archivos/carpetas están en `.gitignore`:

- ✅ `src/data/` (excepto archivos `.example.ts`)
- ✅ Imágenes personales (`public/mia*.png`, `public/comic-*.webp`)
- ✅ Configuraciones de Firebase (`.env`, `firebase-config.ts`)
- ✅ Certificados y claves (`*.pem`, `*.key`)

### **Información Sensible**

❌ **NO incluyas en el repositorio:**
- Emails reales
- Teléfonos personales
- URLs de redes sociales privadas
- Fotos personales identificables
- Información de ubicación específica

✅ **SÍ puedes incluir:**
- Información profesional pública
- Enlaces a perfiles profesionales (GitHub, LinkedIn)
- Experiencia laboral general
- Skills y tecnologías

## 🚀 Despliegue

### **Antes de Subir a GitHub**

1. ✅ Verifica que `.gitignore` esté actualizado
2. ✅ Confirma que no hay información sensible en el código
3. ✅ Prueba que el proyecto funcione con datos de ejemplo
4. ✅ Revisa que las imágenes personales no estén incluidas

### **Variables de Entorno (Futuro)**

Cuando integres Firebase, usa variables de entorno:

```bash
# .env.local (no incluir en Git)
VITE_FIREBASE_API_KEY=tu-api-key
VITE_FIREBASE_AUTH_DOMAIN=tu-proyecto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=tu-proyecto-id
```

## 📝 Checklist de Configuración

- [ ] Copiar archivos de ejemplo a archivos reales
- [ ] Actualizar información de contacto
- [ ] Personalizar secciones "Sobre mí"
- [ ] Completar timeline profesional
- [ ] Añadir imágenes personales
- [ ] Actualizar logo con tu nombre
- [ ] Personalizar textos dinámicos
- [ ] Ajustar colores y tipografía
- [ ] Verificar que información sensible esté protegida
- [ ] Probar funcionamiento completo

## 🆘 Solución de Problemas

### **Error: No se encuentran los datos**

Si ves errores de importación:

1. Verifica que hayas creado los archivos `.ts` (sin `.example`)
2. Confirma que los exports coincidan con los ejemplos
3. Revisa que las rutas de importación sean correctas

### **Imágenes no se muestran**

1. Verifica que las imágenes estén en `public/`
2. Confirma que las rutas en los datos sean correctas
3. Asegúrate de que los formatos sean compatibles (`.png`, `.jpg`, `.webp`)

---

**¡Listo!** Una vez completada la configuración, tendrás tu portfolio personalizado y listo para mostrar al mundo. 🌟
