'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { HiveType, HiveStatus } from '@/lib/types/database.types'

export type FormState = { error?: string }

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

export async function createHive(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const name = (formData.get('name') as string)?.trim()
  const apiaryId = formData.get('apiary_id') as string
  if (!name) return { error: 'El nombre es obligatorio.' }
  if (!apiaryId) return { error: 'Seleccioná un apiario.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('hives') as any).insert({
    organization_id: orgId,
    apiary_id: apiaryId,
    name,
    code: (formData.get('code') as string) || null,
    type: (formData.get('type') as HiveType) || 'langstroth',
    status: (formData.get('status') as HiveStatus) || 'active',
    color: (formData.get('color') as string) || null,
    installation_date: (formData.get('installation_date') as string) || null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/hives')
  redirect('/dashboard/hives')
}

export async function updateHive(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const name = (formData.get('name') as string)?.trim()
  const apiaryId = formData.get('apiary_id') as string
  if (!name) return { error: 'El nombre es obligatorio.' }
  if (!apiaryId) return { error: 'Seleccioná un apiario.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('hives') as any)
    .update({
      apiary_id: apiaryId,
      name,
      code: (formData.get('code') as string) || null,
      type: (formData.get('type') as HiveType) || 'langstroth',
      status: (formData.get('status') as HiveStatus) || 'active',
      color: (formData.get('color') as string) || null,
      installation_date: (formData.get('installation_date') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/hives')
  revalidatePath(`/dashboard/hives/${id}`)
  redirect('/dashboard/hives')
}

export async function deleteHive(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('hives').delete().eq('id', id)
  revalidatePath('/dashboard/hives')
  redirect('/dashboard/hives')
}
