import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Apiary, Hive, Feeding, HiveSuper, RainfallRecord } from '@/lib/types/database.types'
import ApiaryDetailClient from './ApiaryDetailClient'

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

  const { data: apiary } = await supabase
    .from('apiaries')
    .select('*')
    .eq('id', id)
    .eq('organization_id', member.organization_id)
    .single() as { data: Apiary | null }

  if (!apiary) notFound()

  const [{ data: hives }, { data: feedings }] = await Promise.all([
    supabase
      .from('hives')
      .select('*')
      .eq('apiary_id', id)
      .order('name') as unknown as Promise<{ data: Hive[] | null }>,
    supabase
      .from('feedings' as never)
      .select('*, hives(name)')
      .eq('apiary_id', id)
      .order('date', { ascending: false })
      .limit(20),
  ])

  const hiveIds = (hives ?? []).map((h) => h.id)
  let activeSupers: HiveSuper[] = []
  if (hiveIds.length > 0) {
    const { data: supersData } = await supabase
      .from('hive_supers' as never)
      .select('id, hive_id, placed_at')
      .in('hive_id', hiveIds)
      .is('removed_at', null) as { data: Pick<HiveSuper, 'id' | 'hive_id' | 'placed_at'>[] | null }
    activeSupers = (supersData ?? []) as HiveSuper[]
  }

  // Rainfall — last 10 records + year totals
  const thisYear = new Date().getFullYear()
  const { data: rainfallData } = await supabase
    .from('rainfall_records' as never)
    .select('*')
    .eq('apiary_id', id)
    .gte('date', `${thisYear}-01-01`)
    .order('date', { ascending: false }) as { data: RainfallRecord[] | null }

  const rainfall = rainfallData ?? []

  return {
    apiary,
    hives: hives ?? [],
    feedings: (feedings as (Feeding & { hives: { name: string } | null })[]) ?? [],
    activeSupers,
    rainfall,
  }
}

export default async function ApiaryDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { apiary, hives, feedings, activeSupers, rainfall } = await getData(params.id)
  return <ApiaryDetailClient apiary={apiary} hives={hives} feedings={feedings} activeSupers={activeSupers} rainfall={rainfall} />
}
