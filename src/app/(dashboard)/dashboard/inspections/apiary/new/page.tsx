import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { HiveSuper } from '@/lib/types/database.types'
import ApiaryInspectionForm from './ApiaryInspectionForm'

export default async function NewApiaryInspectionPage({
  searchParams,
}: {
  searchParams: { apiary_id?: string }
}) {
  const apiaryId = searchParams.apiary_id
  if (!apiaryId) redirect('/dashboard/apiaries')

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) redirect('/login')

  const [{ data: apiary }, { data: hives }] = await Promise.all([
    supabase
      .from('apiaries')
      .select('id, name')
      .eq('id', apiaryId)
      .eq('organization_id', member.organization_id)
      .single() as unknown as Promise<{ data: { id: string; name: string } | null }>,
    supabase
      .from('hives')
      .select('id, name, code, status')
      .eq('apiary_id', apiaryId)
      .eq('organization_id', member.organization_id)
      .eq('status', 'active')
      .order('name') as unknown as Promise<{ data: { id: string; name: string; code: string | null; status: string }[] | null }>,
  ])

  if (!apiary) redirect('/dashboard/apiaries')

  const hiveIds = (hives ?? []).map((h) => h.id)
  let activeSupers: Pick<HiveSuper, 'id' | 'hive_id' | 'placed_at'>[] = []
  if (hiveIds.length > 0) {
    const { data: supersData } = await supabase
      .from('hive_supers' as never)
      .select('id, hive_id, placed_at')
      .in('hive_id', hiveIds)
      .is('removed_at', null) as { data: Pick<HiveSuper, 'id' | 'hive_id' | 'placed_at'>[] | null }
    activeSupers = supersData ?? []
  }

  return (
    <ApiaryInspectionForm
      apiaryId={apiaryId}
      apiaryName={apiary.name}
      hives={hives ?? []}
      activeSupers={activeSupers}
    />
  )
}
