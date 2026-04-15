import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Apiary } from '@/lib/types/database.types'
import HiveForm from './HiveForm'

async function getApiaries(): Promise<Apiary[]> {
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
    .from('apiaries')
    .select('*')
    .eq('organization_id', member.organization_id)
    .order('name')

  return (data as Apiary[]) ?? []
}

export default async function NewHivePage() {
  const apiaries = await getApiaries()

  if (apiaries.length === 0) {
    redirect('/dashboard/apiaries/new')
  }

  return <HiveForm apiaries={apiaries} />
}
