/**
 * PendingApproval - Componente para mostrar posts pendientes de aprobación
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Check, X, Clock } from 'lucide-react';
import { getPosts, updatePost } from '@/services/postService';
import type { BlogPost } from '@/types/blog.types';
import { getStatusColor, getStatusIcon } from '@/utils/postStatus';
import { useNavigate } from 'react-router-dom';

export default function PendingApproval() {
  const [pendingPosts, setPendingPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadPendingPosts = async () => {
    setLoading(true);
    try {
      const posts = await getPosts();
      const pending = posts.filter(p => p.status === 'pending_review');
      setPendingPosts(pending);
    } catch (error) {
      console.error('Error al cargar posts pendientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPendingPosts();
  }, []);

  const handleApprove = async (post: BlogPost) => {
    try {
      await updatePost(post.id, {
        ...post,
        status: 'published',
        isPublished: true,
      });
      alert(`✅ Post "${post.title}" aprobado y publicado`);
      loadPendingPosts();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  const handleReject = async (post: BlogPost) => {
    const reason = prompt('¿Por qué rechazas este post? (opcional)');
    try {
      await updatePost(post.id, {
        ...post,
        status: 'draft',
        isPublished: false,
      });
      alert(`❌ Post "${post.title}" rechazado y devuelto a borrador${reason ? `\nRazón: ${reason}` : ''}`);
      loadPendingPosts();
    } catch (error: any) {
      alert(`❌ Error: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Posts Pendientes de Aprobación
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            Cargando...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Posts Pendientes de Aprobación
          {pendingPosts.length > 0 && (
            <Badge variant="destructive" className="ml-2">
              {pendingPosts.length}
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Revisa y aprueba los posts que están esperando publicación
        </CardDescription>
      </CardHeader>
      <CardContent>
        {pendingPosts.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p>No hay posts pendientes de aprobación</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                {/* Imagen */}
                {post.featuredImage && (
                  <img
                    src={post.featuredImage}
                    alt={post.title}
                    className="w-20 h-20 object-cover rounded"
                  />
                )}

                {/* Contenido */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm mb-1 truncate">{post.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge
                      style={{
                        backgroundColor: post.category.color,
                        color: 'white',
                      }}
                      className="text-xs"
                    >
                      {post.category.name}
                    </Badge>
                    <Badge
                      style={{
                        backgroundColor: getStatusColor(post.status),
                        color: 'white',
                      }}
                      className="text-xs"
                    >
                      {getStatusIcon(post.status)} En Revisión
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      por {post.author.name}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-2">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => handleApprove(post)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Aprobar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReject(post)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Rechazar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => navigate('/admin/posts')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
