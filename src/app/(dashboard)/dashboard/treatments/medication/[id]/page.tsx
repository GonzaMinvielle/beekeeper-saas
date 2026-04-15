import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { MedicationStock } from '@/lib/types/database.types'
import MedicationEditClient from './MedicationEditClient'

export default async function MedicationEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const { data: medication } = await supabase
    .from('medications_stock')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', member.organization_id)
    .single() as { data: MedicationStock | null }
  if (!medication) notFound()

  return <MedicationEditClient medication={medication} />
}
