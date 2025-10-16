# 📧 Configuración de EmailJS

Este proyecto usa **EmailJS** para enviar emails desde el formulario de contacto sin necesidad de backend.

## 🚀 Pasos para configurar EmailJS

### 1. Crear cuenta en EmailJS

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Haz clic en **"Sign Up"** (Registrarse)
3. Crea tu cuenta (puedes usar Google/GitHub)

---

### 2. Configurar un servicio de email

1. En el dashboard de EmailJS, ve a **"Email Services"**
2. Haz clic en **"Add New Service"**
3. Selecciona tu proveedor de email:
   - **Gmail** (recomendado)
   - Outlook
   - Yahoo
   - Otro
4. Sigue las instrucciones para conectar tu cuenta
5. **Copia el Service ID** (lo necesitarás después)

---

### 3. Crear una plantilla de email

1. Ve a **"Email Templates"**
2. Haz clic en **"Create New Template"**
3. Usa esta plantilla de ejemplo:

```
Asunto: Nuevo mensaje de contacto - {{subject}}

---

Has recibido un nuevo mensaje desde tu portfolio:

Nombre: {{from_name}}
Email: {{from_email}}
Empresa: {{company}}

Asunto: {{subject}}

Mensaje:
{{message}}

---
Enviado desde: tu-portfolio.com
```

4. **Variables disponibles:**
   - `{{from_name}}` - Nombre del remitente
   - `{{from_email}}` - Email del remitente
   - `{{subject}}` - Asunto del mensaje
   - `{{message}}` - Contenido del mensaje
   - `{{company}}` - Empresa (opcional)

5. Haz clic en **"Save"**
6. **Copia el Template ID**

---

### 4. Obtener tu Public Key

1. Ve a **"Account"** → **"General"**
2. Busca **"Public Key"**
3. **Copia el Public Key**

---

### 5. Configurar variables de entorno

Abre tu archivo `.env.local` y agrega:

```env
VITE_EMAILJS_SERVICE_ID=tu_service_id_aqui
VITE_EMAILJS_TEMPLATE_ID=tu_template_id_aqui
VITE_EMAILJS_PUBLIC_KEY=tu_public_key_aqui
```

**Ejemplo:**
```env
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=abcdefghijklmnop
```

---

### 6. Actualizar tu email en el código

Abre `src/services/emailService.ts` y cambia esta línea:

```typescript
to_email: 'tu-email@ejemplo.com', // ← Cambia esto por tu email real
```

Por tu email real:

```typescript
to_email: 'tuemail@gmail.com',
```

---

### 7. Reiniciar el servidor

```bash
npm run dev
```

---

## ✅ Verificar que funciona

1. Ve a la página de **Contacto** en tu sitio
2. Llena el formulario
3. Haz clic en **"Enviar mensaje"**
4. Deberías ver: **"¡Mensaje enviado correctamente!"**
5. Revisa tu email - deberías recibir el mensaje

---

## 🔍 Modo Simulación

Si **NO** configuras las variables de entorno, el formulario funcionará en **modo simulación**:
- ✅ El formulario se enviará correctamente
- ⚠️ NO se enviará email real
- 📝 Los datos se mostrarán en la consola del navegador

Verás este mensaje:
```
✅ [MODO SIMULACIÓN] Mensaje recibido. Configura EmailJS para envíos reales.
```

---

## 📊 Límites del plan gratuito

- ✅ **200 emails/mes** gratis
- ✅ Plantillas ilimitadas
- ✅ Sin tarjeta de crédito requerida

Para más emails, puedes actualizar al plan de pago.

---

## 🐛 Troubleshooting

### Error: "Public Key is required"
- Verifica que hayas copiado correctamente el Public Key
- Asegúrate de que esté en `.env.local`
- Reinicia el servidor

### Error: "Service not found"
- Verifica el Service ID
- Asegúrate de que el servicio esté activo en EmailJS

### No recibo emails
- Revisa tu carpeta de SPAM
- Verifica que el email en `emailService.ts` sea correcto
- Revisa los logs en el dashboard de EmailJS

---

## 📚 Recursos

- [Documentación oficial de EmailJS](https://www.emailjs.com/docs/)
- [EmailJS Dashboard](https://dashboard.emailjs.com/)
- [Plantillas de ejemplo](https://www.emailjs.com/docs/examples/)

---

¡Listo! Ahora tu formulario de contacto enviará emails reales. 🚀
