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

export async function createHarvest(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const hiveId = formData.get('hive_id') as string
  const weightRaw = formData.get('weight_kg') as string
  if (!hiveId) return { error: 'Seleccioná una colmena.' }
  if (!weightRaw || Number(weightRaw) <= 0) return { error: 'El peso debe ser mayor a 0.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('harvests') as any).insert({
    organization_id: ctx.orgId,
    hive_id:         hiveId,
    harvested_at:    (formData.get('harvested_at') as string) || new Date().toISOString().slice(0, 10),
    weight_kg:       Number(weightRaw),
    honey_type:      (formData.get('honey_type') as string) || 'multifloral',
    quality_notes:   (formData.get('quality_notes') as string) || null,
    batch_code:      (formData.get('batch_code') as string) || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/harvests')
  redirect('/dashboard/harvests')
}

export async function updateHarvest(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const weightRaw = formData.get('weight_kg') as string
  if (!weightRaw || Number(weightRaw) <= 0) return { error: 'El peso debe ser mayor a 0.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('harvests') as any)
    .update({
      hive_id:       formData.get('hive_id') as string,
      harvested_at:  formData.get('harvested_at') as string,
      weight_kg:     Number(weightRaw),
      honey_type:    (formData.get('honey_type') as string) || 'multifloral',
      quality_notes: (formData.get('quality_notes') as string) || null,
      batch_code:    (formData.get('batch_code') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', ctx.orgId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/harvests')
  revalidatePath(`/dashboard/harvests/${id}`)
  redirect('/dashboard/harvests')
}

export async function deleteHarvest(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('harvests').delete().eq('id', id)
  revalidatePath('/dashboard/harvests')
  redirect('/dashboard/harvests')
}

export type StockFormState = { error?: string; success?: boolean }

export async function adjustHoneyStock(
  id: string,
  prevState: StockFormState,
  formData: FormData
): Promise<StockFormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const newQty = Number(formData.get('quantity_kg'))
  if (isNaN(newQty) || newQty < 0) return { error: 'Cantidad inválida.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('honey_stock') as any)
    .update({ quantity_kg: newQty, last_updated: new Date().toISOString() })
    .eq('id', id)
    .eq('organization_id', ctx.orgId)

  if (error) return { error: error.message }

  revalidatePath('/dashboard/harvests')
  return { success: true }
}
