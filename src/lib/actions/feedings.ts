'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export type FormState = { error?: string; success?: boolean }

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

export async function createFeeding(
  hiveId: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const foodType = formData.get('food_type') as string
  if (!foodType) return { error: 'Seleccioná un tipo de alimento.' }

  const quantityRaw = formData.get('quantity_kg') as string
  if (!quantityRaw || isNaN(Number(quantityRaw)) || Number(quantityRaw) <= 0) {
    return { error: 'Ingresá una cantidad válida mayor a 0.' }
  }

  const date = formData.get('date') as string
  if (!date) return { error: 'Seleccioná una fecha.' }

  const supabase = createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('feedings') as any).insert({
    org_id: orgId,
    hive_id: hiveId,
    food_type: foodType,
    quantity_kg: Number(quantityRaw),
    date,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/hives/${hiveId}`)
  return { success: true }
}

export async function deleteFeeding(
  feedingId: string,
  hiveId: string | null,
  apiaryId: string | null
): Promise<void> {
  const supabase = createClient()
  await supabase.from('feedings' as never).delete().eq('id', feedingId)

  if (hiveId)   revalidatePath(`/dashboard/hives/${hiveId}`)
  if (apiaryId) revalidatePath(`/dashboard/apiaries/${apiaryId}`)
}
