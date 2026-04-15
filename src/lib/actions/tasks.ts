'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FormState = { error?: string }

async function getOrgAndUser(): Promise<{ orgId: string; userId: string } | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!data) return null
  return { orgId: data.organization_id, userId: user.id }
}

export async function createTask(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const title = formData.get('title') as string
  if (!title.trim()) return { error: 'El título es obligatorio.' }

  const supabase = createClient()
  const hiveId = (formData.get('hive_id') as string) || null
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('tasks') as any).insert({
    organization_id: ctx.orgId,
    hive_id:         hiveId || null,
    title:           title.trim(),
    description:     (formData.get('description') as string) || null,
    due_date:        (formData.get('due_date') as string) || null,
    status:          (formData.get('status') as string) || 'pending',
    priority:        (formData.get('priority') as string) || 'medium',
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/tasks')
  redirect('/dashboard/tasks')
}

export async function updateTaskStatus(
  id: string,
  status: string
): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('tasks') as any)
    .update({ status })
    .eq('id', id)
  revalidatePath('/dashboard/tasks')
}

export async function updateTask(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const title = formData.get('title') as string
  if (!title.trim()) return { error: 'El título es obligatorio.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('tasks') as any)
    .update({
      hive_id:     (formData.get('hive_id') as string) || null,
      title:       title.trim(),
      description: (formData.get('description') as string) || null,
      due_date:    (formData.get('due_date') as string) || null,
      status:      (formData.get('status') as string) || 'pending',
      priority:    (formData.get('priority') as string) || 'medium',
    })
    .eq('id', id)
    .eq('organization_id', ctx.orgId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/tasks')
  redirect('/dashboard/tasks')
}

export async function deleteTask(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('tasks').delete().eq('id', id)
  revalidatePath('/dashboard/tasks')
  redirect('/dashboard/tasks')
}
