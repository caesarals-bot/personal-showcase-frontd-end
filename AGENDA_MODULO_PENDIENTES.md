# Módulo /agenda — Estado y pendientes

> Fecha: 2026-08-02 · Rama: `feature/agenda-reuniones` (base: `main` @ `79229a4`)
> Frontend + backend implementados y verificados (`npm run build` + ESLint OK).
> **El feature NO está activo en producción**: depende de infraestructura (env vars
> de Netlify, OAuth de Google y Firestore) descrita abajo.

## Qué ya está implementado

### Frontend
- Ruta `/agenda` con lazy-loading + `AgendaPageSkeleton` (`src/router/app.router.tsx`).
- UI editorial completa en `src/pages/agenda/`:
  - `AvailabilityCalendar.tsx` — calendario de días disponibles (react-day-picker v10).
  - `SlotPicker.tsx` — horarios libres del día.
  - `BookingForm.tsx` — nombre, email, mensaje opcional + reCAPTCHA.
  - `BookingConfirmation.tsx` — confirmación, link de Meet, descarga `.ics`.
  - `RecommendedReads.tsx` — lecturas del blog en la parte inferior.
- Servicio `src/services/bookingService.ts` + hooks `useBooking*` + libs
  `bookingDates.ts` e `ics.ts` + tipos `src/types/booking.types.ts`.
- Tokens editoriales (teal/terracota/crema) en `src/App.css`.
- Card "¿Prefieres hablar en vivo?" en `/contactame` → enlaza a `/agenda`.
- Formulario de contacto rediseñado al estilo editorial (compacto).

### Backend (Netlify Functions, directorio `netlify/functions/`)
- `booking-settings` — GET, configuración pública (usa `DEFAULT_CONFIG` si no hay doc en Firestore).
- `booking-availability` — GET `?month=YYYY-MM`, días con slots (freebusy + bookings locales).
- `booking-slots` — POST `{ date }`, slots libres con `isoStart`/`isoEnd`.
- `booking-create` — POST, claim atómico (transacción Firestore, ID `dateKey_HHmm`),
  re-verificación freebusy, creación de evento con Meet automático, compensación de fallos.
- Helpers en `netlify/functions/_shared/`: `time`, `schedule`, `firebase`, `google`,
  `validation`, `response`, `recaptcha`, `rate-limit`, `bookings`.

### Seguridad / reglas
- `firestore.rules`: `bookingSettings` público de lectura, escritura solo Admin;
  `bookings` denegado a clientes (solo Admin SDK).
- reCAPTCHA v3 con verificación server-side + rate limiting por email.

## Pendientes (para activar el feature)

### 1. Variables de entorno en Netlify (obligatorias para reservar)
Se configuran en el dashboard de Netlify (Site settings → Environment variables) o
en `.env` local (para `netlify dev`). **Nunca commitear** `.env` con secretos.

| Variable | Obligatoria | Uso |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Sí (reservar) | OAuth Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Sí (reservar) | OAuth Google Calendar |
| `GOOGLE_REFRESH_TOKEN` | Sí (reservar) | Token del dueño (flujo OAuth de una sola vez) |
| `GOOGLE_CALENDAR_ID` | No | Default `primary` |
| `RECAPTCHA_SECRET` | Sí (reservar) | Verificación server-side del reCAPTCHA |
| `FIREBASE_PROJECT_ID` | No | Default `my-page-showcase` |
| `FIREBASE_SERVICE_ACCOUNT` | No | JSON del service account; si no se provee, Netlify usa la integración Firebase/Google |

Nota: `booking-settings`, `booking-availability` y `booking-slots` **no necesitan**
las credenciales Google para el calendario del sitio; sin `GOOGLE_*` solo falla la
parte de reserva (creación de evento / consulta de busy). Para la experiencia
completa se requieren las tres.

### 2. OAuth de Google (una sola vez)
1. [Google Cloud Console](https://console.cloud.google.com/) → APIs y servicios →
   Biblioteca → habilitar **Google Calendar API**.
2. Credenciales → Crear credenciales → **ID de cliente OAuth** (tipo *Web*).
   - URI de redirección: `https://xn--cesarlondoo-beb.dev` (**punycode**, sin `ñ` —
     los headers HTTP solo admiten ASCII; ver `HISTORY.md` 2026-07-04).
3. Generar el `GOOGLE_REFRESH_TOKEN` con la cuenta `proyectosenevolucion@gmail.com`
   (flujo OAuth manual, p.ej. vía `googleapis` + `OAuth2` en un script one-shot).
4. El calendario por defecto es `primary` de esa cuenta; para otro, indicar su ID
   en `GOOGLE_CALENDAR_ID`.

### 3. Firestore
- Las reglas ya están en `firestore.rules` (pendiente: el deploy de reglas con la
  CLI `firebase deploy --only firestore:rules`).
- El documento `bookingSettings/config` es **opcional** (existe `DEFAULT_CONFIG`:
  L-V 09:00-17:00, 30 min, 24h de antelación, 60 días horizonte, `America/Santiago`,
  owner `César Londoño` / `proyectosenevolucion@gmail.com`). Para personalizar, crear
  un doc con los mismos campos. Forma exacta: `netlify/functions/_shared/schedule.ts`.
- Cancelación de reservas: **solo el dueño**, borrando el doc
  `bookings/{dateKey_HHmm}` (ej. `2026-08-14_0900`) y el evento en Google Calendar.
  No hay UI de admin aún.

### 4. Dev local
```bash
netlify dev   # sirve el sitio + las Netlify Functions (same-origin / .netlify/functions)
```
- `npm run dev` (vite solo) **no** sirve las funciones: `/agenda` mostrará el **modo
  vista previa** (banner + calendario con horarios de ejemplo, reserva deshabilitada).
  Ese fallback es intencional y está etiquetado.

### 5. Limpieza / revisión menor
- `netlify.toml:34` — `Access-Control-Allow-Origin: https://vocal-baklava-c94c36.netlify.app`
  (dominio Netlify viejo). Las llamadas a las funciones son same-origin (no requieren
  CORS), pero conviene corregir o eliminar la referencia obsoleta.
- Verificar CSP `connect-src` incluye same-origin (ya lo hace: `'self'`).

### 6. Verificación post-deploy
1. Abrir `https://xn--cesarlondoo-beb.dev/agenda`.
2. El calendario muestra días con horario laboral; al elegir día se ven slots.
3. Reservar → crear el evento con Meet → confirmación + `.ics` descargable.
4. El evento aparece en Google Calendar con el visitante como invitado.

---

## 7. Gestión de disponibilidad (desactivar días/horas) — PLAN PARA MAÑANA

### Estado actual
- **Sí se puede desactivar días/horas hoy**, pero **sin UI**: editando a mano el
  documento de Firestore `bookingSettings/config` (reglas ya permiten escritura solo
  admin; lectura pública).
  - Días de la semana / horas → array `workingHours` (por `dayOfWeek` 0=dom..6=sáb,
    con `start`/`end` "HH:mm"). Quitar un día o `"00:00"`–`"00:00"` lo desactiva.
  - Fechas puntuales → `dateOverrides: [{ date: "YYYY-MM-DD", available: false }]`.
  - `getBookingConfig()` hace merge sobre `DEFAULT_CONFIG` → un doc parcial funciona.
- **Limitación**: las reglas de `bookings` deniegan lectura/escritura a clientes
  (solo Admin SDK). Una UI de admin en el navegador **no puede listar reservas**
  sin una Netlify Function extra (`booking-admin-list`, con verificación de admin).
  Para desactivar días/horas NO hace falta eso: solo se escribe `bookingSettings`.

### Plan propuesto (1 commit, corto)
1. Página admin **"Agenda"** en `/admin` (patrón de `HomeSettingsPage.tsx`):
   - Toggles por día de la semana (L-V) + inputs `start`/`end`.
   - Lista de fechas bloqueadas (`dateOverrides`) con añadir/eliminar.
   - Botón guardar → `db.doc('bookingSettings/config').set({...}, { merge: true })`
     (solo admin autenticado, cumple las reglas).
2. Validación: los cambios se reflejan en `/agenda` (días tachados / sin horarios).
3. `npm run build` + `npx eslint src/ netlify/` + commit.

### Decisiones a confirmar mañana (defaults recomendados en negrita)
- **Dónde**: página nueva en `/admin` (**recomendado**) vs. algo más simple.
- **Alcance**: solo desactivar días/horas (**recomendado primero**) vs. además
  listar/gestionar reservas (requiere la Netlify Function `booking-admin-list`).
- **Horario**: mismo horario L-V con toggles por día + fechas bloqueadas
  (**recomendado**) vs. horario configurable por día individual.

---

## Flujo de trabajo (a partir de mañana)

**Planes de trabajo cortos y verificables** para evitar errores y deuda técnica:

1. Cada plan es **una sola tarea acotada** (idealmente < 1 sesión).
2. Al terminar un plan: `npm run build` + `npx eslint src/ netlify/` → deben pasar.
3. **Commit inmediato** por plan, con mensaje que describa el plan
   (p. ej. `feat(agenda): ...`, `fix(contacto): ...`).
4. No mezclar planes en un mismo commit.
5. Si un plan se "extiende", parar y consultar antes de seguir (evitar alucinaciones).
6. Documentar lo cerrado en `HISTORY.md` / `CHANGELOG.md` al final de cada plan.
