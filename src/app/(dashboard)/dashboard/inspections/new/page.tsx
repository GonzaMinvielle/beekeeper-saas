import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Hive } from '@/lib/types/database.types'
import InspectionForm from './InspectionForm'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

async function getHives(): Promise<HiveWithApiary[]> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }

  if (!member) return []

  const { data } = await supabase
    .from('hives')
    .select('*, apiaries(name)')
    .eq('organization_id', member.organization_id)
    .eq('status', 'active')
    .order('name')

  return (data as HiveWithApiary[]) ?? []
}

export default async function NewInspectionPage() {
  const hives = await getHives()

  if (hives.length === 0) {
    redirect('/dashboard/hives/new')
  }

  return <InspectionForm hives={hives} />
}
