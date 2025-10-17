/**
 * LikeButton - Botón de like con animación
 */

import { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { likePost, unlikePost, hasUserLikedPost, getPostLikesCount } from '@/services/likeService';
import { updatePostLikesCount } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';
import { motion } from 'framer-motion';

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  onLikeChange?: (newCount: number) => void;
  size?: 'sm' | 'md' | 'lg';
  showCount?: boolean;
}

export function LikeButton({
  postId,
  initialLikes,
  onLikeChange,
  size = 'md',
  showCount = true,
}: LikeButtonProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  // Cargar estado inicial - se ejecuta cada vez que cambia el postId o el user
  useEffect(() => {
    const loadInitialState = async () => {
      try {
        // Obtener contador real
        const realCount = await getPostLikesCount(postId);
        setLikesCount(realCount);
        
        // Verificar si el usuario ya dio like
        if (user?.id) {
          const hasLiked = await hasUserLikedPost(postId, user.id);
          setLiked(hasLiked);
        } else {
          setLiked(false);
        }
      } catch (error) {
        console.error('Error al cargar estado inicial del like:', error);
      }
    };
    loadInitialState();
  }, [postId, user?.id]); // Usar user?.id para detectar cambios de autenticación

  const handleLike = async () => {
    if (!user) {
      alert('Debes iniciar sesión para dar like');
      return;
    }

    // OPTIMISTIC UPDATE: Actualizar UI inmediatamente
    const previousLiked = liked;
    const previousCount = likesCount;
    
    setLiked(!liked);
    setLikesCount(liked ? likesCount - 1 : likesCount + 1);
    setLoading(true);

    try {
      if (previousLiked) {
        // Quitar like
        await unlikePost(postId, user.id);
      } else {
        // Dar like
        await likePost(postId, user.id);
      }
      
      // Obtener el contador real actualizado
      const newCount = await getPostLikesCount(postId);
      setLikesCount(newCount);
      
      // Actualizar el contador en el post
      await updatePostLikesCount(postId, newCount);
      
      onLikeChange?.(newCount);
    } catch (error: any) {
      console.error('Error al dar like:', error);
      
      // REVERTIR cambios si hay error
      setLiked(previousLiked);
      setLikesCount(previousCount);
      
      // Mensaje más descriptivo
      if (error.message?.includes('permission') || error.message?.includes('Missing or insufficient permissions')) {
        alert('No tienes permisos para dar like. Asegúrate de estar registrado correctamente.');
      } else {
        alert(`Error: ${error.message || 'No se pudo dar like'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'h-8 text-xs',
    md: 'h-9 text-sm',
    lg: 'h-10 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <Button
      variant={liked ? 'default' : 'outline'}
      size="sm"
      onClick={handleLike}
      disabled={loading}
      className={`${sizeClasses[size]} ${
        liked
          ? 'bg-red-500 hover:bg-red-600 text-white border-red-500'
          : 'hover:bg-red-50 hover:text-red-500 hover:border-red-500'
      } transition-all duration-200`}
    >
      <motion.div
        animate={liked ? { scale: [1, 1.3, 1] } : {}}
        transition={{ duration: 0.3 }}
      >
        <Heart
          className={`${iconSizes[size]} ${liked ? 'fill-current' : ''}`}
        />
      </motion.div>
      {showCount && <span className="ml-1">{likesCount}</span>}
    </Button>
  );
}
