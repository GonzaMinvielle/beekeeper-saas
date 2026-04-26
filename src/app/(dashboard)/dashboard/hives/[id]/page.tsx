import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Apiary, Hive, Inspection, Queen, Feeding, HiveSuper } from '@/lib/types/database.types'
import HiveDetailClient from './HiveDetailClient'

type InspectionWithHealth = Inspection & { overall_health: number | null }

export type ApiaryInspectionEvent = {
  id: string
  inspection_id: string
  inspected_at: string
  observation: string | null
  priority: 'low' | 'medium' | 'high'
  apiary_name: string | null
  general_notes: string | null
}

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

  const [
    { data: apiaries },
    { data: inspections },
    { data: queen },
    { data: apiaryDetails },
    { data: feedings },
    { data: supers },
  ] = await Promise.all([
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
    // Apiary inspections where this hive was marked
    supabase
      .from('apiary_inspection_details' as never)
      .select(`
        id,
        inspection_id,
        observation,
        priority,
        inspections!inner (
          inspected_at,
          general_notes,
          apiaries ( name )
        )
      `)
      .eq('hive_id', id)
      .order('created_at', { ascending: false })
      .limit(10),
    supabase
      .from('feedings' as never)
      .select('*')
      .eq('hive_id', id)
      .order('date', { ascending: false }),
    supabase
      .from('hive_supers' as never)
      .select('*')
      .eq('hive_id', id)
      .order('placed_at', { ascending: false }),
  ])

  // Flatten apiary details
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const apiaryEvents: ApiaryInspectionEvent[] = ((apiaryDetails ?? []) as any[]).map((d) => ({
    id: d.id,
    inspection_id: d.inspection_id,
    inspected_at: d.inspections?.inspected_at ?? '',
    observation: d.observation,
    priority: d.priority,
    apiary_name: d.inspections?.apiaries?.name ?? null,
    general_notes: d.inspections?.general_notes ?? null,
  }))

  return {
    hive,
    apiaries: (apiaries as Apiary[]) ?? [],
    inspections: (inspections as InspectionWithHealth[]) ?? [],
    queen: (queen as Queen | null) ?? null,
    apiaryEvents,
    feedings: (feedings as Feeding[]) ?? [],
    supers: (supers as HiveSuper[]) ?? [],
  }
}

export default async function HiveDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { hive, apiaries, inspections, queen, apiaryEvents, feedings, supers } = await getData(params.id)
  return (
    <HiveDetailClient
      hive={hive}
      apiaries={apiaries}
      inspections={inspections}
      queen={queen}
      apiaryEvents={apiaryEvents}
      feedings={feedings}
      supers={supers}
    />
  )
}
