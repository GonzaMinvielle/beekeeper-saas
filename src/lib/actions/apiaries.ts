'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

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

export async function createApiary(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'El nombre es obligatorio.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('apiaries') as any).insert({
    organization_id: orgId,
    name,
    location: (formData.get('location') as string) || null,
    latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
    longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath('/dashboard/apiaries')
  redirect('/dashboard/apiaries')
}

export async function updateApiary(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const name = (formData.get('name') as string)?.trim()
  if (!name) return { error: 'El nombre es obligatorio.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('apiaries') as any)
    .update({
      name,
      location: (formData.get('location') as string) || null,
      latitude: formData.get('latitude') ? Number(formData.get('latitude')) : null,
      longitude: formData.get('longitude') ? Number(formData.get('longitude')) : null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/apiaries')
  revalidatePath(`/dashboard/apiaries/${id}`)
  redirect('/dashboard/apiaries')
}

export async function deleteApiary(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('apiaries').delete().eq('id', id)
  revalidatePath('/dashboard/apiaries')
  redirect('/dashboard/apiaries')
}
