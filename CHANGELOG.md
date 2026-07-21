# Changelog — Trabajo en Curso

> **Registro LIVIANO de cambios activos.** Solo lo que se está trabajando AHORA.
> Cambios cerrados/finalizados → [`HISTORY.md`](./HISTORY.md).
> Al cerrar un cambio, se mueve a `HISTORY.md` con su commit hash.

> **Para el estado consolidado de ImageKit** (proveedor, servicios, deletes, compat, pendientes)
> ver [`IMAGEKIT_HISTORY.md`](./IMAGEKIT_HISTORY.md).

---

## Trabajo Actual (2026-07-22)
- **2026-07-22** — Fix: Persistencia de `fileIds` en galerías + deletes de ImageKit robustos.
  - **Bug A (fileIds en galería):** `PostsPage` y `ProjectForm` desincronizaban `galleryFileIds` con `gallery[]` al subir imágenes nuevas. El `onImagesUploaded` concatenaba al final mientras `onImagesChange` reordenaba por índice, dejando fileIds en posiciones incorrectas. Fix: usar `Map<url, fileId>` para actualizar por URL, preservando fileIds conocidos.
  - **Bug B (early return silencioso):** `removeFeaturedImage`/`removeGalleryImage`/`removeProjectCoverImage`/`removeProjectGalleryImage`/`removeAboutImage` retornaban early sin error si faltaba `fileId`. El admin veía "✅ eliminada" pero nada pasaba. Fix: usar `imageUrl` como fallback en `ImageKitService.deleteImage(fileId, imageUrl)` (la Netlify Function ya lo soporta), y propagar errores con `throw`.
  - **Bug D (deletePost/deleteProject con fileIds vacíos):** `deletePostFromFirestore` y `deleteProject` solo incluían `fileIds` poblados en el array de borrado, ignorando proyectos/posts legacy sin `fileId`. Fix: usar `{fileId, imageUrl}` para que cada imagen se intente borrar con fallback por URL.
  - **Validación temprana:** `deleteImage` ahora lanza error claro si no hay `fileId` ni `imageUrl`.

## Trabajo Actual (2026-07-21)
- **2026-07-21** — Fix: Prevención de imágenes huérfanas al reemplazar. Se interceptan las actualizaciones en los servicios (`postService`, `projectService`, `aboutService`) para borrar automáticamente de ImageKit las imágenes reemplazadas o eliminadas de galerías.
- **2026-07-21** — Fix crítico: Mapeo de `fileIds` en `postService.ts` (Firestore) que provocaba que no se detectaran imágenes reemplazadas en blogs. Se corrigió también `ImageSelector` y los formularios `PostsPage` y `ProjectForm` para capturar correctamente los `fileIds` de las galerías usando `onImagesUploaded`.

---

_Sin trabajo en curso. Última entrada cerrada:_

- **2026-07-15** — Portafolio migrado a `ImageSelector` + `fileIds`. Ver
  [`IMAGEKIT_HISTORY.md`](./IMAGEKIT_HISTORY.md) sección *"Historia cerrada de la
  integración"*.

---

> **Las secciones cerradas de ImageKit (6 entradas del 2026-07-14/15)**
> **fueron movidas a** [`IMAGEKIT_HISTORY.md`](./IMAGEKIT_HISTORY.md) (sección
> *"Historia cerrada de la integración"*) para liberar peso de este archivo.
> `CHANGELOG.md` solo conserva el trabajo en curso.