import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Task, Hive } from '@/lib/types/database.types'
import TaskEditClient from './TaskEditClient'

type HiveWithApiary = Hive & { apiaries: { name: string } | null }

export default async function TaskEditPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', member.organization_id)
    .single() as { data: Task | null }
  if (!task) notFound()

  const { data: hives } = await supabase
    .from('hives')
    .select('*, apiaries(name)')
    .eq('organization_id', member.organization_id)
    .order('name')

  return <TaskEditClient task={task} hives={(hives as HiveWithApiary[]) ?? []} />
}
