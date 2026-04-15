'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Supabase v2.103 con PostgrestVersion "12" infiere `never` en tablas nuevas
// hasta que se regeneren los tipos desde la CLI. Usamos `any` en esas tablas.
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('forum_posts').delete().eq('id', id)
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

  revalidatePath(`/dashboard/community/${postId}`)
  return {}
}

export async function deleteReply(id: string, postId: string) {
  const { supabase } = await getOrgAndUser()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from('forum_replies').delete().eq('id', id)
  revalidatePath(`/dashboard/community/${postId}`)
  redirect(`/dashboard/community/${postId}`)
}
