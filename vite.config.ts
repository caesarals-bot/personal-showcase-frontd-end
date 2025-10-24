import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  base: '/', // ✅ Asegura rutas correctas en Netlify y SPA
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [], // Solo en producción
    legalComments: 'none', // ✅ Reduce bundle size eliminando comentarios legales
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks - librerías externas
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion', 'lucide-react'],
          'vendor-firebase': ['firebase/app', 'firebase/auth', 'firebase/firestore'],
          'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
          
          // Feature chunks - funcionalidades específicas
          'auth': [
            './src/auth/components/LoginForm.tsx',
            './src/auth/components/RegisterForm.tsx',
            './src/auth/pages/LoginPage.tsx',
            './src/auth/pages/RegisterPage.tsx'
          ],
          'admin': [
            './src/admin/layouts/AdminLayout.tsx',
            './src/admin/pages/AdminPage.tsx',
            './src/admin/pages/PostsPage.tsx',
            './src/admin/pages/CategoriesPage.tsx',
            './src/admin/pages/TagsPage.tsx',
            './src/admin/pages/UsersPage.tsx'
          ],
          'blog': [
            './src/pages/blog/BlogPage.tsx',
            './src/pages/blog/PostPage.tsx'
          ],
          'portfolio': [
            './src/pages/portfolio/PortfolioPage.tsx',
            './src/pages/ProjectDetailPage.tsx'
          ]
        }
      }
    },
    // Optimizaciones adicionales
    chunkSizeWarningLimit: 1000,
    sourcemap: false, // Desactivar sourcemaps en producción para reducir tamaño
    minify: 'esbuild', // Usar esbuild para mejor rendimiento
    target: 'es2020',

    // ✅ Importante para Netlify: asegúrate de salida limpia
    assetsInlineLimit: 4096,
    cssCodeSplit: true,
    outDir: 'dist',
    emptyOutDir: true,
  },
  // Optimizaciones para desarrollo
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'framer-motion',
      'lucide-react'
    ]
  },
  server: {
    port: 5173,
    open: true,
    host: true, // ✅ Permite acceso desde red local
  },
  preview: {
    port: 4173,
    host: true,
    strictPort: true,
  },
  // ✅ Configuración específica para Netlify
  experimental: {
    renderBuiltUrl(filename, { hostType }) {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { relative: true }
      }
    }
  },
}))
