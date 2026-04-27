import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TeamClient from './TeamClient'
import type { OrgMemberWithEmail, OrgInvitation } from '@/lib/types/database.types'

async function getData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: me } = await supabase
    .from('org_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string; role: string } | null }

  if (!me) redirect('/dashboard')

  const [{ data: members }, { data: invitations }] = await Promise.all([
    supabase
      .from('org_members')
      .select('id, organization_id, user_id, role, joined_at, display_name')
      .eq('organization_id', me.organization_id)
      .order('joined_at'),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (supabase as any)
      .from('org_invitations')
      .select('*')
      .eq('organization_id', me.organization_id)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ])

  return {
    members: (members ?? []) as OrgMemberWithEmail[],
    invitations: (invitations ?? []) as OrgInvitation[],
    myRole: me.role,
    myUserId: user.id,
  }
}

export default async function TeamPage() {
  const { members, invitations, myRole, myUserId } = await getData()
  return (
    <TeamClient
      members={members}
      invitations={invitations}
      myRole={myRole}
      myUserId={myUserId}
    />
  )
}
