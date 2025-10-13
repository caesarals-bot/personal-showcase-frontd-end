/**
 * Hook para gestionar notificaciones del admin
 */

import { useState, useEffect } from 'react';
import { getPosts } from '@/services/postService';
import type { BlogPost } from '@/types/blog.types';

export interface Notification {
  id: string;
  type: 'post_review' | 'new_comment' | 'new_like';
  title: string;
  message: string;
  post?: BlogPost;
  createdAt: string;
  read: boolean;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // Cargar notificaciones
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const posts = await getPosts();
      
      // Posts en revisión
      const reviewPosts = posts.filter(p => p.status === 'review');
      const reviewNotifications: Notification[] = reviewPosts.map(post => ({
        id: `review-${post.id}`,
        type: 'post_review',
        title: 'Post en revisión',
        message: `"${post.title}" está esperando tu aprobación`,
        post,
        createdAt: post.updatedAt || post.publishedAt,
        read: false,
      }));

      setNotifications(reviewNotifications);
    } catch (error) {
      console.error('Error al cargar notificaciones:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
    
    // Recargar cada 30 segundos
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // Marcar como leída
  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Marcar todas como leídas
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Contador de no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  return {
    notifications,
    loading,
    unreadCount,
    markAsRead,
    markAllAsRead,
    refresh: loadNotifications,
  };
}
