import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Harvest, Hive } from '@/lib/types/database.types'
import HarvestDetailClient from './HarvestDetailClient'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

export default async function HarvestDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const { data: harvest } = await supabase
    .from('harvests')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', member.organization_id)
    .single() as { data: Harvest | null }
  if (!harvest) notFound()

  const { data: hives } = await supabase
    .from('hives')
    .select('*, apiaries(name)')
    .eq('organization_id', member.organization_id)
    .eq('status', 'active')
    .order('name')

  return <HarvestDetailClient harvest={harvest} hives={(hives as HiveWithApiary[]) ?? []} />
}
