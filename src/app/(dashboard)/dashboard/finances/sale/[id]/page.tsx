import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import SaleEditClient from './SaleEditClient'
import type { Sale } from '@/lib/types/database.types'

export default async function EditSalePage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const { data: sale } = await supabase
    .from('sales')
    .select('*')
    .eq('id', params.id)
    .eq('organization_id', member.organization_id)
    .single()

  if (!sale) notFound()

  return <SaleEditClient sale={sale as Sale} />
}
