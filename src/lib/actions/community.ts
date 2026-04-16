'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyClient = ReturnType<typeof createClient> & { from(table: string): any }

async function getOrgAndUser() {
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

  return { supabase, user, orgId: member.organization_id }
}

// ── Forum Posts ───────────────────────────────────────────────

export async function createPost(_prevState: { error?: string }, formData: FormData) {
  const { supabase, user, orgId } = await getOrgAndUser()

  const title    = formData.get('title')?.toString().trim() ?? ''
  const content  = formData.get('content')?.toString().trim() ?? ''
  const category = formData.get('category')?.toString() ?? 'general'

  if (!title || !content) return { error: 'El título y el contenido son obligatorios.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('forum_posts').insert({
    organization_id: orgId,
    user_id: user.id,
    title,
    content,
    category,
  })
  if (error) return { error: (error as { message: string }).message }

  revalidatePath('/dashboard/community')
  redirect('/dashboard/community')
}

export async function deletePost(id: string) {
  const { supabase } = await getOrgAndUser()
  await supabase.from('forum_posts').delete().eq('id', id)
  revalidatePath('/dashboard/community')
  redirect('/dashboard/community')
}

// ── Forum Replies ─────────────────────────────────────────────

export async function createReply(postId: string, _prevState: { error?: string }, formData: FormData) {
  const { supabase, user } = await getOrgAndUser()

  const content = formData.get('content')?.toString().trim() ?? ''
  if (!content) return { error: 'La respuesta no puede estar vacía.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('forum_replies').insert({
    post_id: postId,
    user_id: user.id,
    content,
  })
  if (error) return { error: (error as { message: string }).message }

  // ── Notificar al autor del post si es distinto al que responde ──
  try {
    const postRes = await supabase
      .from('forum_posts')
      .select('user_id, organization_id, title')
      .eq('id', postId)
      .single()

    const post = postRes.data as { user_id: string; organization_id: string; title: string } | null

    if (post && post.user_id !== user.id) {
      // Obtener display_name del que responde desde org_members
      const nameRes = await supabase
        .from('org_members')
        .select('display_name')
        .eq('user_id', user.id)
        .single()
      const displayName = (nameRes.data as { display_name: string | null } | null)?.display_name
        ?? user.email?.split('@')[0]
        ?? 'Alguien'

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (supabase as any).from('notifications').insert({
        organization_id: post.organization_id,
        user_id: post.user_id,
        type: 'forum_reply',
        message: `${displayName} comentó en tu post "${post.title}"`,
        read: false,
      })
    }
  } catch {
    // No bloquear si la notificación falla
  }

  revalidatePath(`/dashboard/community/${postId}`)
  return {}
}

export async function deleteReply(id: string, postId: string) {
  const { supabase } = await getOrgAndUser()
  await supabase.from('forum_replies').delete().eq('id', id)
  revalidatePath(`/dashboard/community/${postId}`)
  redirect(`/dashboard/community/${postId}`)
}
