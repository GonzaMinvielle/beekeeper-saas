'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type FloweringFormState = { error?: string }

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

export async function createFlowering(
  prevState: FloweringFormState,
  formData: FormData
): Promise<FloweringFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const plantName = formData.get('plant_name') as string
  if (!plantName?.trim()) return { error: 'El nombre de la planta es requerido.' }

  const startMonth = Number(formData.get('start_month'))
  const endMonth   = Number(formData.get('end_month'))
  if (!startMonth || startMonth < 1 || startMonth > 12) return { error: 'Mes de inicio inválido.' }
  if (!endMonth   || endMonth   < 1 || endMonth   > 12) return { error: 'Mes de fin inválido.' }

  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('flowering_calendar') as any).insert({
    organization_id: orgId,
    plant_name:      plantName.trim(),
    start_month:     startMonth,
    end_month:       endMonth,
    region:          (formData.get('region') as string) || null,
    notes:           (formData.get('notes') as string) || null,
  })
  if (error) return { error: error.message }

  revalidatePath('/dashboard/weather')
  return {}
}

export async function deleteFlowering(id: string): Promise<void> {
  const orgId = await getOrgId()
  if (!orgId) return
  const supabase = createClient()
  await supabase.from('flowering_calendar').delete().eq('id', id).eq('organization_id', orgId)
  revalidatePath('/dashboard/weather')
  redirect('/dashboard/weather')
}
