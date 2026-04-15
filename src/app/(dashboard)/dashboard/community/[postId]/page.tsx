import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { deleteReply } from '@/lib/actions/community'
import ConfirmDeleteButton from '@/components/ui/ConfirmDeleteButton'
import ReplyForm from './ReplyForm'

const categoryLabel: Record<string, { label: string; color: string }> = {
  general:   { label: 'General',      color: 'bg-gray-100 text-gray-600' },
  disease:   { label: 'Enfermedades', color: 'bg-red-100 text-red-700' },
  harvest:   { label: 'Cosechas',     color: 'bg-amber-100 text-amber-700' },
  equipment: { label: 'Equipamiento', color: 'bg-blue-100 text-blue-700' },
}

type PostRow  = { id: string; title: string; content: string; category: string; created_at: string }
type ReplyRow = { id: string; post_id: string; user_id: string; content: string; created_at: string }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

async function getData(postId: string) {
  const supabase = createClient() as AnyClient
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const postRes = await supabase
    .from('forum_posts')
    .select('id, title, content, category, created_at')
    .eq('id', postId)
    .single()
  const post = postRes.data as PostRow | null
  if (!post) notFound()

  const repliesRes = await supabase
    .from('forum_replies')
    .select('id, post_id, user_id, content, created_at')
    .eq('post_id', postId)
    .order('created_at', { ascending: true })
  const replies = (repliesRes.data ?? []) as ReplyRow[]

  return { post, replies, userId: user.id }
}

export default async function PostPage({
  params,
}: {
  params: { postId: string }
}) {
  const { post, replies, userId } = await getData(params.postId)
  const cat = categoryLabel[post.category] ?? categoryLabel.general

  const postDate = new Date(post.created_at).toLocaleDateString('es-AR', {
    day: '2-digit', month: 'long', year: 'numeric',
  })

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/community" className="text-sm text-amber-600 hover:text-amber-700 font-medium">
        ← Volver al foro
      </Link>

      {/* Post */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${cat.color}`}>
            {cat.label}
          </span>
          <span className="text-xs text-gray-400">{postDate}</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-3">{post.title}</h1>
        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">{post.content}</p>
      </div>

      {/* Respuestas */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {replies.length} respuesta{replies.length !== 1 ? 's' : ''}
          </h2>
        </div>

        {replies.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            Todavía no hay respuestas. ¡Sé el primero en responder!
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {replies.map((reply) => {
              const replyDate = new Date(reply.created_at).toLocaleDateString('es-AR', {
                day: '2-digit', month: 'short', year: 'numeric',
              })
              return (
                <li key={reply.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-xs text-gray-400 mb-1">{replyDate}</p>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                        {reply.content}
                      </p>
                    </div>
                    {reply.user_id === userId && (
                      <ConfirmDeleteButton
                        action={deleteReply.bind(null, reply.id, post.id)}
                        message="¿Eliminar esta respuesta?"
                        className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded shrink-0"
                      >
                        Eliminar
                      </ConfirmDeleteButton>
                    )}
                  </div>
                </li>
              )
            })}
          </ul>
        )}

        {/* Formulario de respuesta */}
        <div className="p-5 border-t border-gray-100">
          <h3 className="font-medium text-gray-900 mb-3 text-sm">Agregar respuesta</h3>
          <ReplyForm postId={post.id} />
        </div>
      </div>
    </div>
  )
}
