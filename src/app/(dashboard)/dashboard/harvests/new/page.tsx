import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Hive } from '@/lib/types/database.types'
import HarvestForm from './HarvestForm'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

export default async function NewHarvestPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const { data: hives } = await supabase
    .from('hives')
    .select('*, apiaries(name)')
    .eq('organization_id', member.organization_id)
    .eq('status', 'active')
    .order('name')

  return <HarvestForm hives={(hives as HiveWithApiary[]) ?? []} />
}
