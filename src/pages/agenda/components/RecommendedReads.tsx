import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getPosts } from '@/services/postService'
import type { BlogPost } from '@/types/blog.types'

export function RecommendedReads() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    getPosts({ published: true, limit: 3 })
      .then(list => {
        if (!cancelled) setPosts(list)
      })
      .catch(() => {
        if (!cancelled) setPosts([])
      })
      .finally(() => {
        if (!cancelled) setLoaded(true)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (!loaded || posts.length === 0) return null

  return (
    <section className="mx-auto mt-14 w-full max-w-4xl px-4">
      <div className="mb-5 flex items-center gap-3">
        <h2 className="font-editorial text-2xl font-bold tracking-tight text-editorial-ink">
          Lecturas recomendadas
        </h2>
        <div className="h-px flex-1 bg-editorial-line" />
      </div>
      <div className="grid grid-cols-1 gap-px border border-editorial-line bg-editorial-line sm:grid-cols-3">
        {posts.map(post => (
          <Link
            key={post.id}
            to={`/blog/${post.slug}`}
            className="group flex flex-col justify-between gap-4 bg-editorial-cream p-5 transition-colors hover:bg-editorial-cream/70"
          >
            <p className="text-sm font-medium leading-snug text-editorial-ink">
              {post.title}
            </p>
            <span className="inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-widest text-editorial-teal">
              Leer
              <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
