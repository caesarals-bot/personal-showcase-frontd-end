{{ ... }}
## shadcn/ui (componentes UI)
shadcn/ui provee componentes accesibles basados en Radix + Tailwind.

> Documentación oficial: https://ui.shadcn.com/docs (revisa "Getting Started", "Theming" y la referencia de componentes antes de agregar nuevos).

1. Instalar utilidades requeridas:
```bash
npm i class-variance-authority clsx tailwind-merge lucide-react tailwindcss-animate
```
{{ ... }}
4. Asegura el plugin de animaciones en `tailwind.config.js` si el init no lo añadió:
```js
plugins: [require('tailwindcss-animate')]
```
> Para cada componente que añadas con `npx shadcn@latest add <componente>`, consulta su página en la docs para props, accesibilidad y ejemplos actualizados.

---

{{ ... }}
## Próximos pasos
- Integrar `React Router` en `main.tsx`.
- Inicializar `shadcn/ui` y añadir primeros componentes.
- Crear `AppLayout` con header/footer y navegación.
- Crear módulo `home` con su `HomePage`.

---

## Referencias oficiales
- Vite: https://vitejs.dev/
- React Router: https://reactrouter.com/
- TailwindCSS: https://tailwindcss.com/docs
- shadcn/ui: https://ui.shadcn.com/docs
