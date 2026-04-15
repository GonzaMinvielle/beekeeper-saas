import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import ExpenseForm from './ExpenseForm'
import type { Hive } from '@/lib/types/database.types'

export default async function NewExpensePage() {
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
    .select('id, name')
    .eq('organization_id', member.organization_id)
    .eq('status', 'active')
    .order('name')

  return <ExpenseForm hives={(hives as Hive[]) ?? []} />
}
