import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts - Carga inmediata (necesarios para todas las rutas)
import AdminLayout from "@/admin/layouts/AdminLayout";
import PagesLayout from "@/pages/layouts/PagesLayout";

// HomePage - Carga inmediata (primera impresión)
import HomePage from "../pages/home/HomePage";

// Lazy Loading - Páginas secundarias
const ContactMePage = lazy(() => import("../pages/contactme/ContactMePage"));
const BlogPage = lazy(() => import("../pages/blog/BlogPage"));
const PostPage = lazy(() => import("../pages/blog/PostPage"));
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const PortfolioPage = lazy(() => import("../pages/portfolio/PorftfoliPage"));

// Lazy Loading - Auth Pages
const LoginPage = lazy(() => import("@/auth/pages/LoginPage").then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import("@/auth/pages/RegisterPage").then(m => ({ default: m.RegisterPage })));

// Lazy Loading - Admin Pages (prioridad alta)
const AdminPage = lazy(() => import("@/admin/pages/AdminPage"));
const PostsPage = lazy(() => import("@/admin/pages/PostsPage"));
const CategoriesPage = lazy(() => import("@/admin/pages/CategoriesPage"));
const TagsPage = lazy(() => import("@/admin/pages/TagsPage"));
const UsersPage = lazy(() => import("@/admin/pages/UsersPage"));
const ProfilePage = lazy(() => import("@/admin/pages/ProfilePage"));
const TimelinePage = lazy(() => import("@/admin/pages/TimelinePage"));
const FirestoreSetupPage = lazy(() => import("@/admin/pages/FirestoreSetupPage"));
const DataMigrationPage = lazy(() => import("@/admin/pages/DataMigrationPage"));

// Loading fallback component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground/20 border-t-foreground mx-auto" />
      <p className="text-muted-foreground">Cargando...</p>
    </div>
  </div>
);

// Wrapper para Suspense
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <PagesLayout />,
        children: [
            {
                index: true,
                element: <HomePage />, // Carga inmediata
            },
            {
                path: 'contactame',
                element: withSuspense(ContactMePage),
            },      
            {
                path: 'about',
                element: withSuspense(AboutPage),
            },
            {
                path: 'portfolio',
                element: withSuspense(PortfolioPage),
            },
            {
                path: 'blog',
                children: [
                    {
                        index: true,
                        element: withSuspense(BlogPage),
                    },
                    {
                        path: ':slug',
                        element: withSuspense(PostPage),
                    }
                ]
            },
        ]
    },
    
    {
        path: '/auth',
        children: [
            {
                path: 'login',
                element: withSuspense(LoginPage),
            },
            {
                path: 'register',
                element: withSuspense(RegisterPage),
            },
        ]
    },
    
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: withSuspense(AdminPage),
            },
            {
                path: 'posts',
                element: withSuspense(PostsPage),
            },
            {
                path: 'categories',
                element: withSuspense(CategoriesPage),
            },
            {
                path: 'tags',
                element: withSuspense(TagsPage),
            },
            {
                path: 'users',
                element: withSuspense(UsersPage),
            },
            {
                path: 'profile',
                element: withSuspense(ProfilePage),
            },
            {
                path: 'timeline',
                element: withSuspense(TimelinePage),
            },
            {
                path: 'firestore',
                element: withSuspense(FirestoreSetupPage),
            },
            {
                path: 'data-migration',
                element: withSuspense(DataMigrationPage),
            },
        ]
    },
    {
        path: '*',
        element: <div>404</div>,
    },
])