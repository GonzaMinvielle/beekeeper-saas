'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

async function getOrgId(): Promise<string | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  return data?.organization_id ?? null
}

export type SuperFormState = { error?: string; success?: boolean }

export async function addHiveSuper(
  hiveId: string,
  prevState: SuperFormState,
  formData: FormData
): Promise<SuperFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autenticado' }

  const placed_at = (formData.get('placed_at') as string) || new Date().toISOString().slice(0, 10)
  const notes = (formData.get('notes') as string) || null

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('hive_supers') as any).insert({
    org_id: orgId,
    hive_id: hiveId,
    placed_at,
    notes: notes || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/hives/${hiveId}`)
  revalidatePath('/dashboard')
  return { success: true }
}

export async function removeHiveSuper(
  superId: string,
  hiveId: string,
  formData: FormData
): Promise<void> {
  const supabase = createClient()
  const removed_at = (formData.get('removed_at') as string) || new Date().toISOString().slice(0, 10)
  const removal_reason = (formData.get('removal_reason') as string) || 'other'
  const notes = (formData.get('notes') as string) || null

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('hive_supers') as any)
    .update({ removed_at, removal_reason, notes: notes || null })
    .eq('id', superId)

  revalidatePath(`/dashboard/hives/${hiveId}`)
  revalidatePath('/dashboard')
}

export async function deleteHiveSuper(
  superId: string,
  hiveId: string
): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('hive_supers') as any).delete().eq('id', superId)

  revalidatePath(`/dashboard/hives/${hiveId}`)
  revalidatePath('/dashboard')
}
