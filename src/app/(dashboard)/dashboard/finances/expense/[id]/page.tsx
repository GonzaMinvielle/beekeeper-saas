import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import ExpenseEditClient from './ExpenseEditClient'
import type { Expense, Hive } from '@/lib/types/database.types'

export default async function EditExpensePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any
  const [expenseRes, hivesRes] = await Promise.all([
    db.from('expenses').select('*').eq('id', params.id).eq('organization_id', member.organization_id).single(),
    db.from('hives').select('id, name').eq('organization_id', member.organization_id).eq('status', 'active').order('name'),
  ])

  if (!expenseRes.data) notFound()

  return (
    <ExpenseEditClient
      expense={expenseRes.data as Expense}
      hives={(hivesRes.data as Hive[]) ?? []}
    />
  )
}
