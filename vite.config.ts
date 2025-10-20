import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
  }
})
