import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deletePost } from '@/lib/actions/community'
import ConfirmDeleteButton from '@/components/ui/ConfirmDeleteButton'
import NewPostForm from './NewPostForm'

type Post = {
  id: string
  title: string
  content: string
  category: string
  likes: number
  created_at: string
  user_id: string
  author_name: string
  reply_count: number
}

const categoryLabel: Record<string, { label: string; color: string }> = {
  general:   { label: 'General',      color: 'bg-gray-100 text-gray-600' },
  disease:   { label: 'Enfermedades', color: 'bg-red-100 text-red-700' },
  harvest:   { label: 'Cosechas',     color: 'bg-amber-100 text-amber-700' },
  equipment: { label: 'Equipamiento', color: 'bg-blue-100 text-blue-700' },
}

type PostRow   = { id: string; title: string; content: string; category: string; likes: number; created_at: string; user_id: string }
type ReplyRow  = { post_id: string }
type MemberRow = { user_id: string; display_name: string | null }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

async function getData(category?: string) {
  const supabase = createClient() as AnyClient
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const memberRes = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
  const member = memberRes.data as { organization_id: string } | null
  if (!member) redirect('/dashboard')

  let query = supabase
    .from('forum_posts')
    .select('id, title, content, category, likes, created_at, user_id')
    .eq('organization_id', member.organization_id)
    .order('created_at', { ascending: false })

  if (category) query = query.eq('category', category)

  const postsRes = await query
  const posts = (postsRes.data ?? []) as PostRow[]

  // Contar replies por post
  const postIds = posts.map((p) => p.id)
  const replyCountMap: Record<string, number> = {}
  if (postIds.length > 0) {
    const repliesRes = await supabase
      .from('forum_replies')
      .select('post_id')
      .in('post_id', postIds)
    ;((repliesRes.data ?? []) as ReplyRow[]).forEach((r) => {
      replyCountMap[r.post_id] = (replyCountMap[r.post_id] ?? 0) + 1
    })
  }

  // Obtener display_name de todos los autores de posts
  const userIds = Array.from(new Set(posts.map((p) => p.user_id)))
  const nameMap: Record<string, string> = {}
  if (userIds.length > 0) {
    const membersRes = await supabase
      .from('org_members')
      .select('user_id, display_name')
      .in('user_id', userIds)
    ;((membersRes.data ?? []) as MemberRow[]).forEach((m) => {
      nameMap[m.user_id] = m.display_name ?? 'Usuario'
    })
  }

  return {
    posts: posts.map((p) => ({
      ...p,
      reply_count: replyCountMap[p.id] ?? 0,
      author_name: nameMap[p.user_id] ?? 'Usuario',
    })) as Post[],
    currentUserId: user.id,
  }
}

export default async function CommunityPage({
  searchParams,
}: {
  searchParams: { category?: string }
}) {
  const { posts, currentUserId } = await getData(searchParams.category)
  const categories = ['', 'disease', 'harvest', 'equipment', 'general']

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comunidad</h1>
          <p className="text-gray-500 text-sm mt-1">Compartí experiencias con otros apicultores</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/dashboard/community/diseases"
            className="px-3 py-1.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg hover:bg-red-100 transition-colors"
          >
            🔬 Biblioteca de enfermedades
          </Link>
          <NewPostForm />
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => {
          const info = cat ? categoryLabel[cat] : null
          const isActive = (searchParams.category ?? '') === cat
          return (
            <Link
              key={cat}
              href={cat ? `/dashboard/community?category=${cat}` : '/dashboard/community'}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors
                ${isActive
                  ? 'bg-[#1D9E75] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {cat ? info?.label : 'Todos'}
            </Link>
          )
        })}
      </div>

      {/* Lista de posts */}
      {posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center text-gray-400">
          <p className="text-4xl mb-2">💬</p>
          <p className="text-sm">Todavía no hay publicaciones. ¡Sé el primero!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => {
            const cat = categoryLabel[post.category] ?? categoryLabel.general
            const date = new Date(post.created_at).toLocaleDateString('es-AR', {
              day: '2-digit', month: 'short', year: 'numeric',
            })
            return (
              <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>
                        {cat.label}
                      </span>
                      <span className="text-xs text-gray-400">{date}</span>
                      <span className="text-xs text-[#1D9E75] font-medium">· {post.author_name}</span>
                    </div>
                    <Link
                      href={`/dashboard/community/${post.id}`}
                      className="font-semibold text-gray-900 hover:text-[#1D9E75] transition-colors line-clamp-1"
                    >
                      {post.title}
                    </Link>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                      <span>💬 {post.reply_count} respuesta{post.reply_count !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  {post.user_id === currentUserId && (
                    <ConfirmDeleteButton
                      action={deletePost.bind(null, post.id)}
                      message={`¿Eliminar "${post.title}"?`}
                      className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded shrink-0"
                    >
                      Eliminar
                    </ConfirmDeleteButton>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
