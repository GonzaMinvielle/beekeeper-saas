'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { QueenStatus, MarkingColor } from '@/lib/types/database.types'

export type QueenFormState = { error?: string; success?: boolean }

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

export async function saveQueen(
  hiveId: string,
  prevState: QueenFormState,
  formData: FormData
): Promise<QueenFormState> {
  const orgId = await getOrgId()
  if (!orgId) return { error: 'No se encontró tu organización.' }

  const supabase = createClient()

  const queenData = {
    organization_id: orgId,
    hive_id: hiveId,
    status: (formData.get('queen_status') as QueenStatus) || 'active',
    year_born: formData.get('year_born') ? Number(formData.get('year_born')) : null,
    marking_color: (formData.get('marking_color') as MarkingColor) || null,
    notes: (formData.get('queen_notes') as string) || null,
  }

  // Buscar si ya existe reina para esta colmena
  const { data: existing } = await supabase
    .from('queens')
    .select('id')
    .eq('hive_id', hiveId)
    .maybeSingle() as { data: { id: string } | null }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = existing?.id
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? await (supabase.from('queens') as any).update(queenData).eq('id', existing.id)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    : await (supabase.from('queens') as any).insert(queenData)

  if (error) return { error: error.message }

  revalidatePath(`/dashboard/hives/${hiveId}`)
  return { success: true }
}
