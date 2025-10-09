import { createBrowserRouter } from "react-router";
import HomePage from "../pages/home/HomePage";
import ContactMePage from "../pages/contactme/ContactMePage";
import BlogPage from "../pages/blog/BlogPage";
import AboutPage from "../pages/about/AboutPage";
import AdminPage from "@/admin/pages/AdminPage";
import AdminLayout from "@/admin/layouts/AdminLayout";
import PagesLayout from "@/pages/layouts/PagesLayout";
import { LoginPage } from "@/auth/pages/LoginPage";
import { RegisterPage } from "@/auth/pages/RegisterPage";

export const appRouter = createBrowserRouter([
    {
        path: '/',
        element: <PagesLayout />,
        children: [
            {
                index: true,
                element: <HomePage />,
            },
            {
                path: 'contactame',
                element: <ContactMePage />,
            },      
            {
                path: 'about',
                element: <AboutPage />,
            },
            {
                path: 'blog',
                element: <BlogPage />,
            },
        ]
    },
    
    {
        path: '/auth',
        children: [
            {
                path: 'login',
                element: <LoginPage />,
            },
            {
                path: 'register',
                element: <RegisterPage />,
            },
        ]
    },
    
    {
        path: '/admin',
        element: <AdminLayout />,
        children: [
            {
                index: true,
                element: <AdminPage />,
            },
            // TODO: Agregar rutas para posts, categories, tags, etc.
        ]
    },
    {
        path: '*',
        element: <div>404</div>,
    },
])