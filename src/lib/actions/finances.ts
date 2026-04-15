'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FinanceFormState = { error?: string }

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

// ─── GASTOS ──────────────────────────────────────────────────────────────────

export async function createExpense(
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const amountRaw = formData.get('amount') as string
  if (!amountRaw || Number(amountRaw) <= 0) return { error: 'El monto debe ser mayor a 0.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('expenses') as any).insert({
    organization_id: orgId,
    hive_id:         (formData.get('hive_id') as string) || null,
    category:        (formData.get('category') as string) || 'other',
    amount:          Number(amountRaw),
    currency:        (formData.get('currency') as string) || 'ARS',
    expense_date:    (formData.get('expense_date') as string) || new Date().toISOString().slice(0, 10),
    description:     (formData.get('description') as string) || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/finances')
  redirect('/dashboard/finances')
}

export async function updateExpense(
  id: string,
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const amountRaw = formData.get('amount') as string
  if (!amountRaw || Number(amountRaw) <= 0) return { error: 'El monto debe ser mayor a 0.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('expenses') as any)
    .update({
      hive_id:      (formData.get('hive_id') as string) || null,
      category:     (formData.get('category') as string) || 'other',
      amount:       Number(amountRaw),
      currency:     (formData.get('currency') as string) || 'ARS',
      expense_date: (formData.get('expense_date') as string),
      description:  (formData.get('description') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', orgId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/finances')
  redirect('/dashboard/finances')
}

export async function deleteExpense(id: string): Promise<void> {
  const orgId = await getOrgId()
  if (!orgId) return
  const supabase = createClient()
  await supabase.from('expenses').delete().eq('id', id).eq('organization_id', orgId)
  revalidatePath('/dashboard/finances')
  redirect('/dashboard/finances')
}

// ─── VENTAS ──────────────────────────────────────────────────────────────────

export async function createSale(
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const qtyRaw   = formData.get('quantity_kg') as string
  const priceRaw = formData.get('price_per_kg') as string
  if (!qtyRaw   || Number(qtyRaw)   <= 0) return { error: 'La cantidad debe ser mayor a 0.' }
  if (!priceRaw || Number(priceRaw) <= 0) return { error: 'El precio debe ser mayor a 0.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('sales') as any).insert({
    organization_id: orgId,
    honey_type:      (formData.get('honey_type') as string) || 'multifloral',
    quantity_kg:     Number(qtyRaw),
    price_per_kg:    Number(priceRaw),
    buyer_name:      (formData.get('buyer_name') as string) || null,
    sale_date:       (formData.get('sale_date') as string) || new Date().toISOString().slice(0, 10),
    batch_ref:       (formData.get('batch_ref') as string) || null,
    notes:           (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/finances')
  redirect('/dashboard/finances')
}

export async function updateSale(
  id: string,
  prevState: FinanceFormState,
  formData: FormData
): Promise<FinanceFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const qtyRaw   = formData.get('quantity_kg') as string
  const priceRaw = formData.get('price_per_kg') as string
  if (!qtyRaw   || Number(qtyRaw)   <= 0) return { error: 'La cantidad debe ser mayor a 0.' }
  if (!priceRaw || Number(priceRaw) <= 0) return { error: 'El precio debe ser mayor a 0.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('sales') as any)
    .update({
      honey_type:   (formData.get('honey_type') as string) || 'multifloral',
      quantity_kg:  Number(qtyRaw),
      price_per_kg: Number(priceRaw),
      buyer_name:   (formData.get('buyer_name') as string) || null,
      sale_date:    (formData.get('sale_date') as string),
      batch_ref:    (formData.get('batch_ref') as string) || null,
      notes:        (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('organization_id', orgId)
  if (error) return { error: error.message }

  revalidatePath('/dashboard/finances')
  redirect('/dashboard/finances')
}

export async function deleteSale(id: string): Promise<void> {
  const orgId = await getOrgId()
  if (!orgId) return
  const supabase = createClient()
  await supabase.from('sales').delete().eq('id', id).eq('organization_id', orgId)
  revalidatePath('/dashboard/finances')
  redirect('/dashboard/finances')
}
