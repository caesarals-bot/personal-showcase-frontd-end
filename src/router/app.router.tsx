import { createBrowserRouter } from "react-router-dom";
import HomePage from "../pages/home/HomePage";
import ContactMePage from "../pages/contactme/ContactMePage";
import BlogPage from "../pages/blog/BlogPage";
import PostPage from "../pages/blog/PostPage";
import AboutPage from "../pages/about/AboutPage";
import AdminPage from "@/admin/pages/AdminPage";
import PostsPage from "@/admin/pages/PostsPage";
import CategoriesPage from "@/admin/pages/CategoriesPage";
import TagsPage from "@/admin/pages/TagsPage";
import UsersPage from "@/admin/pages/UsersPage";
import ProfilePage from "@/admin/pages/ProfilePage";
import TimelinePage from "@/admin/pages/TimelinePage";
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
                children: [
                    {
                        index: true,
                        element: <BlogPage />,
                    },
                    {
                        path: ':slug',
                        element: <PostPage />,
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
            {
                path: 'posts',
                element: <PostsPage />,
            },
            {
                path: 'categories',
                element: <CategoriesPage />,
            },
            {
                path: 'tags',
                element: <TagsPage />,
            },
            {
                path: 'users',
                element: <UsersPage />,
            },
            {
                path: 'profile',
                element: <ProfilePage />,
            },
            {
                path: 'timeline',
                element: <TimelinePage />,
            },
        ]
    },
    {
        path: '*',
        element: <div>404</div>,
    },
])