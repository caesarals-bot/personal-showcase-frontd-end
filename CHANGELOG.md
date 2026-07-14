# Changelog — Trabajo en Curso

> **Registro LIVIANO de cambios activos.** Solo lo que se está trabajando AHORA.
> Cambios cerrados/finalizados → [`HISTORY.md`](./HISTORY.md).
> Al cerrar un cambio, se mueve a `HISTORY.md` con su commit hash.

---

## [2026-07-14] - Implementación ImageKit Dual Upload

### Descripción
Plan documentado en `implementation_plan.md`. Rama de trabajo: `feature/imagekit-dual-upload`.

### Arquitectura
- ImageKit como proveedor principal de upload
- Firebase Storage como fallback
- Netlify Functions para firma HMAC (server-side)
- Frontend usa fetch directo (sin SDK ImageKit)

### Fases planificadas
1. ✅ Estructura base y configuración
2. 🔄 Netlify Functions (imagekit-auth, imagekit-delete)
3. ⏳ Servicio ImageKit frontend + dualUploadService
4. ⏳ Integración en imageOptimizer
5. ⏳ Verificación visual (upload real)
6. ⏳ Commit final

### Pendientes
- Testing con credenciales reales ImageKit
- Configurar Firebase Storage como origin externo en ImageKit (trabajo separado)

---
