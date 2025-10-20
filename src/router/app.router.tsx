import { createBrowserRouter } from "react-router-dom";
import { lazy, Suspense } from "react";

// Layouts - Carga inmediata (necesarios para todas las rutas)
import AdminLayout from "@/admin/layouts/AdminLayout";
import PagesLayout from "@/pages/layouts/PagesLayout";

// HomePage - Carga inmediata (primera impresión)
import HomePage from "../pages/home/HomePage";

// Skeletons específicos
import {
  BlogPageSkeleton,
  PortfolioPageSkeleton,
  AboutPageSkeleton,
  ContactPageSkeleton,
  AuthPageSkeleton,
  AdminPageSkeleton,
  PostDetailSkeleton,
  ProjectDetailSkeleton
} from "@/components/skeletons";

// Lazy Loading - Páginas secundarias
const ContactMePage = lazy(() => import("../pages/contactme/ContactMePage"));
const BlogPage = lazy(() => import("../pages/blog/BlogPage"));
const PostPage = lazy(() => import("../pages/blog/PostPage"));
const AboutPage = lazy(() => import("../pages/about/AboutPage"));
const PortfolioPage = lazy(() => import("../pages/portfolio/PortfolioPage"));
const ProjectDetailPage = lazy(() => import("../pages/ProjectDetailPage"));

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
const ProjectsManagementPage = lazy(() => import("@/admin/pages/ProjectsManagementPage"));
const FirestoreSetupPage = lazy(() => import("@/admin/pages/FirestoreSetupPage"));
const DataMigrationPage = lazy(() => import("@/admin/pages/DataMigrationPage"));
const MigrationPage = lazy(() => import("@/pages/admin/MigrationPage"));

// Wrappers para Suspense con skeletons específicos
const withSuspense = (
  Component: React.LazyExoticComponent<any>, 
  SkeletonComponent: React.ComponentType
) => (
  <Suspense fallback={<SkeletonComponent />}>
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
                element: withSuspense(ContactMePage, ContactPageSkeleton),
            },      
            {
                path: 'about',
                element: withSuspense(AboutPage, AboutPageSkeleton),
            },
            {
                path: 'portfolio',
                children: [
                    {
                        index: true,
                        element: withSuspense(PortfolioPage, PortfolioPageSkeleton),
                    },
                    {
                        path: ':slug',
                        element: withSuspense(ProjectDetailPage, ProjectDetailSkeleton),
                    }
                ]
            },
            {
                path: 'blog',
                children: [
                    {
                        index: true,
                        element: withSuspense(BlogPage, BlogPageSkeleton),
                    },
                    {
                        path: ':slug',
                        element: withSuspense(PostPage, PostDetailSkeleton),
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
                element: withSuspense(LoginPage, AuthPageSkeleton),
            },
            {
                path: 'register',
                element: withSuspense(RegisterPage, AuthPageSkeleton),
            },
        ]
    },
    
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: withSuspense(AdminPage, AdminPageSkeleton),
            },
            {
                path: 'posts',
                element: withSuspense(PostsPage, AdminPageSkeleton),
            },
            {
                path: 'categories',
                element: withSuspense(CategoriesPage, AdminPageSkeleton),
            },
            {
                path: 'tags',
                element: withSuspense(TagsPage, AdminPageSkeleton),
            },
            {
                path: 'users',
                element: withSuspense(UsersPage, AdminPageSkeleton),
            },
            {
                path: 'profile',
                element: withSuspense(ProfilePage, AdminPageSkeleton),
            },
            {
                path: 'timeline',
                element: withSuspense(TimelinePage, AdminPageSkeleton),
            },
            {
                path: 'projects',
                element: withSuspense(ProjectsManagementPage, AdminPageSkeleton),
            },
            {
                path: 'firestore',
                element: withSuspense(FirestoreSetupPage, AdminPageSkeleton),
            },
            {
                path: 'data-migration',
                element: withSuspense(DataMigrationPage, AdminPageSkeleton),
            },
            {
                path: 'projects-migration',
                element: withSuspense(MigrationPage, AdminPageSkeleton),
            },

        ]
    },
    {
        path: '*',
        element: <div>404</div>,
    },
])