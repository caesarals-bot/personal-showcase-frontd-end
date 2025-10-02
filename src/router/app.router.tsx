import { createBrowserRouter } from "react-router";
import HomePage from "../pages/home/HomePage";
import PorftfoliPage from "../pages/portfolio/PorftfoliPage";
import ContactMePage from "../pages/contactme/ContactMePage";
import BlogPage from "../pages/blog/BlogPage";
import AboutPage from "../pages/about/AboutPage";
import AdminPage from "@/admin/pages/AdminPage";
import PagesLayout from "@/pages/layouts/PagesLayout";


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
                path: 'portfolio',
                element: <PorftfoliPage />,
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
        path: '/admin',
        element: <AdminPage />,
    },
    {
        path: '*',
        element: <div>404</div>,
    },
])