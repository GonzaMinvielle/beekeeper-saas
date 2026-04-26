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

export type RainfallFormState = {
  error?: string
  success?: boolean
  conflict?: { date: string; existing_mm: number }
}

export async function upsertRainfall(
  apiaryId: string,
  prevState: RainfallFormState,
  formData: FormData
): Promise<RainfallFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No autenticado' }

  const date = formData.get('date') as string
  const mm = parseFloat(formData.get('mm_recorded') as string)
  const notes = (formData.get('notes') as string) || null
  const force = formData.get('force') === 'true'

  if (!date) return { error: 'Fecha requerida' }
  if (isNaN(mm) || mm < 0) return { error: 'Milímetros inválidos' }

  const supabase = createClient()

  if (!force) {
    // Check for existing record on same date
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: existing } = await (supabase.from('rainfall_records') as any)
      .select('id, mm_recorded')
      .eq('apiary_id', apiaryId)
      .eq('date', date)
      .maybeSingle()

    if (existing) {
      return { conflict: { date, existing_mm: existing.mm_recorded } }
    }
  }

  // Upsert (insert or update on conflict)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from('rainfall_records') as any).upsert(
    { org_id: orgId, apiary_id: apiaryId, date, mm_recorded: mm, notes },
    { onConflict: 'apiary_id,date' }
  )

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/apiaries/${apiaryId}`)
  revalidatePath('/dashboard/reports')
  return { success: true }
}

export async function deleteRainfall(
  recordId: string,
  apiaryId: string
): Promise<void> {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase.from('rainfall_records') as any).delete().eq('id', recordId)
  revalidatePath(`/dashboard/apiaries/${apiaryId}`)
  revalidatePath('/dashboard/reports')
}
