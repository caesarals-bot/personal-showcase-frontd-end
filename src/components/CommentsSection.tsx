/**
 * CommentsSection - Sección de comentarios de un post
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Heart, Reply, Edit, Trash2 } from 'lucide-react';
import {
  getPostComments,
  createComment,
  updateComment,
  deleteComment,
  likeComment,
} from '@/services/commentService';
import { updatePostCommentsCount } from '@/services/postService';
import { useAuth } from '@/hooks/useAuth';
import type { BlogComment } from '@/types/blog.types';

interface CommentsSectionProps {
  postId: string;
  onCommentCountChange?: (count: number) => void;
}

export function CommentsSection({ postId, onCommentCountChange }: CommentsSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Cargar comentarios
  const loadComments = async () => {
    setLoading(true);
    try {
      const data = await getPostComments(postId);
      setComments(data);
      const totalCount = data.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0);
      onCommentCountChange?.(totalCount);
      // Actualizar el contador en el post
      await updatePostCommentsCount(postId, totalCount);
    } catch (error) {
      console.error('Error al cargar comentarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, [postId]);

  // Crear comentario
  const handleSubmitComment = async () => {
    if (!user) {
      alert('Debes iniciar sesión para comentar');
      return;
    }

    if (!newComment.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    setSubmitting(true);
    try {
      await createComment({
        postId,
        author: {
          id: user.id,
          name: user.displayName,
          avatar: user.avatar,
          email: user.email,
          isVerified: user.isVerified,
        },
        content: newComment.trim(),
        parentId: replyingTo || undefined,
      });

      setNewComment('');
      setReplyingTo(null);
      await loadComments();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Editar comentario
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim()) {
      alert('El comentario no puede estar vacío');
      return;
    }

    try {
      await updateComment(commentId, { content: editContent.trim() });
      setEditingId(null);
      setEditContent('');
      await loadComments();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Eliminar comentario
  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de eliminar este comentario?')) return;

    try {
      await deleteComment(commentId);
      await loadComments();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Like a comentario
  const handleLikeComment = async (commentId: string) => {
    try {
      await likeComment(commentId);
      await loadComments();
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    }
  };

  // Renderizar un comentario
  const renderComment = (comment: BlogComment, isReply = false) => {
    const isEditing = editingId === comment.id;
    const isAuthor = user?.id === comment.author.id;

    return (
      <div
        key={comment.id}
        className={`${isReply ? 'ml-12 mt-3' : 'mt-4'} p-4 border rounded-lg bg-card`}
      >
        <div className="flex gap-3">
          {/* Avatar */}
          <Avatar className="h-10 w-10">
            <AvatarImage src={comment.author.avatar} alt={comment.author.name} />
            <AvatarFallback>{comment.author.name[0]}</AvatarFallback>
          </Avatar>

          {/* Contenido */}
          <div className="flex-1">
            {/* Header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-sm">{comment.author.name}</span>
              {comment.author.isVerified && (
                <Badge variant="secondary" className="text-xs">
                  ✓ Verificado
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                {new Date(comment.createdAt).toLocaleDateString('es-ES', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {comment.updatedAt && (
                <span className="text-xs text-muted-foreground">(editado)</span>
              )}
            </div>

            {/* Contenido del comentario */}
            {isEditing ? (
              <div className="space-y-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleEditComment(comment.id)}>
                    Guardar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent('');
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mb-3">{comment.content}</p>
            )}

            {/* Acciones */}
            {!isEditing && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLikeComment(comment.id)}
                  className="h-7 text-xs"
                >
                  <Heart className="h-3 w-3 mr-1" />
                  {comment.likes}
                </Button>
                {!isReply && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setReplyingTo(comment.id)}
                    className="h-7 text-xs"
                  >
                    <Reply className="h-3 w-3 mr-1" />
                    Responder
                  </Button>
                )}
                {isAuthor && (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                      className="h-7 text-xs"
                    >
                      <Edit className="h-3 w-3 mr-1" />
                      Editar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteComment(comment.id)}
                      className="h-7 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3 mr-1" />
                      Eliminar
                    </Button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Respuestas */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-3">
            {comment.replies.map((reply) => renderComment(reply, true))}
          </div>
        )}

        {/* Formulario de respuesta */}
        {replyingTo === comment.id && (
          <div className="ml-12 mt-3 space-y-2">
            <Textarea
              placeholder={`Responder a ${comment.author.name}...`}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              rows={3}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={handleSubmitComment} disabled={submitting}>
                <Send className="h-3 w-3 mr-1" />
                Responder
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setReplyingTo(null);
                  setNewComment('');
                }}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <MessageSquare className="h-5 w-5" />
        <h3 className="text-xl font-semibold">
          Comentarios ({comments.reduce((acc, c) => acc + 1 + (c.replies?.length || 0), 0)})
        </h3>
      </div>

      {/* Formulario de nuevo comentario */}
      {user ? (
        <div className="space-y-3">
          <div className="flex gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback>{user.displayName[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Escribe un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                rows={3}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button onClick={handleSubmitComment} disabled={submitting || !newComment.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Comentar
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 border rounded-lg bg-muted/50 text-center">
          <p className="text-sm text-muted-foreground">
            Debes iniciar sesión para comentar
          </p>
        </div>
      )}

      {/* Lista de comentarios */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Cargando comentarios...</div>
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No hay comentarios aún. ¡Sé el primero en comentar!</p>
        </div>
      ) : (
        <div className="space-y-4">{comments.map((comment) => renderComment(comment))}</div>
      )}
    </div>
  );
}
