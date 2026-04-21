import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Apiary, Hive, Inspection, Queen } from '@/lib/types/database.types'
import HiveDetailClient from './HiveDetailClient'

type InspectionWithHealth = Inspection & { overall_health: number | null }

async function getData(id: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) redirect('/dashboard')

  const { data: hive } = await supabase
    .from('hives')
    .select('*')
    .eq('id', id)
    .eq('organization_id', member.organization_id)
    .single() as { data: Hive | null }

  if (!hive) notFound()

  const [{ data: apiaries }, { data: inspections }, { data: queen }] = await Promise.all([
    supabase
      .from('apiaries')
      .select('*')
      .eq('organization_id', member.organization_id)
      .order('name'),
    supabase
      .from('inspections')
      .select('*')
      .eq('hive_id', id)
      .order('inspected_at', { ascending: false })
      .limit(10),
    supabase
      .from('queens')
      .select('*')
      .eq('hive_id', id)
      .maybeSingle(),
  ])

  return {
    hive,
    apiaries: (apiaries as Apiary[]) ?? [],
    inspections: (inspections as InspectionWithHealth[]) ?? [],
    queen: (queen as Queen | null) ?? null,
  }
}

export default async function HiveDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { hive, apiaries, inspections, queen } = await getData(params.id)
  return <HiveDetailClient hive={hive} apiaries={apiaries} inspections={inspections} queen={queen} />
}
