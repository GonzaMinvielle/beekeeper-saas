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

// ─── TRATAMIENTOS ────────────────────────────────────────────────────────────

export async function createTreatment(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const hiveId = formData.get('hive_id') as string
  const productName = formData.get('product_name') as string
  if (!hiveId) return { error: 'Seleccioná una colmena.' }
  if (!productName.trim()) return { error: 'El nombre del producto es obligatorio.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('treatments') as any).insert({
    organization_id: ctx.orgId,
    hive_id:         hiveId,
    product_name:    productName.trim(),
    dose:            (formData.get('dose') as string) || null,
    applied_at:      (formData.get('applied_at') as string) || new Date().toISOString().slice(0, 10),
    applied_by:      ctx.userId,
    next_check_date: (formData.get('next_check_date') as string) || null,
    notes:           (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/treatments')
  redirect('/dashboard/treatments')
}

export async function updateTreatment(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const productName = formData.get('product_name') as string
  if (!productName.trim()) return { error: 'El nombre del producto es obligatorio.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('treatments') as any)
    .update({
      hive_id:         formData.get('hive_id') as string,
      product_name:    productName.trim(),
      dose:            (formData.get('dose') as string) || null,
      applied_at:      formData.get('applied_at') as string,
      next_check_date: (formData.get('next_check_date') as string) || null,
      notes:           (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', ctx.orgId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/treatments')
  revalidatePath(`/dashboard/treatments/${id}`)
  redirect('/dashboard/treatments')
}

export async function deleteTreatment(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('treatments').delete().eq('id', id)
  revalidatePath('/dashboard/treatments')
  redirect('/dashboard/treatments')
}

// ─── STOCK DE MEDICAMENTOS ────────────────────────────────────────────────────

export async function createMedication(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const productName = formData.get('product_name') as string
  if (!productName.trim()) return { error: 'El nombre del producto es obligatorio.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('medications_stock') as any).insert({
    organization_id: ctx.orgId,
    product_name:    productName.trim(),
    quantity:        Number(formData.get('quantity')) || 0,
    unit:            (formData.get('unit') as string) || 'ml',
    expiry_date:     (formData.get('expiry_date') as string) || null,
    notes:           (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/treatments')
  redirect('/dashboard/treatments')
}

export async function updateMedication(
  id: string,
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const ctx = await getOrgAndUser()
  if (!ctx) return { error: 'No se encontró tu organización.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('medications_stock') as any)
    .update({
      product_name: (formData.get('product_name') as string).trim(),
      quantity:     Number(formData.get('quantity')) || 0,
      unit:         (formData.get('unit') as string) || 'ml',
      expiry_date:  (formData.get('expiry_date') as string) || null,
      notes:        (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', ctx.orgId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/treatments')
  return {}
}

export async function deleteMedication(id: string): Promise<void> {
  const supabase = createClient()
  await supabase.from('medications_stock').delete().eq('id', id)
  revalidatePath('/dashboard/treatments')
  redirect('/dashboard/treatments')
}
