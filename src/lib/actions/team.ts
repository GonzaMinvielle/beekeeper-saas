'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { OrgRole } from '@/lib/types/database.types'

type MemberRow = { organization_id: string; role: string }
type TargetRow = { role: string; user_id: string }

// ── CREAR INVITACIÓN ──────────────────────────────────────────
export async function createInvitation(
  prevState: { error?: string; token?: string },
  formData: FormData
): Promise<{ error?: string; token?: string }> {
  const role = (formData.get('role') as OrgRole) ?? 'member'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single() as { data: MemberRow | null }

  if (!member) return { error: 'No se encontró la organización.' }
  if (!['owner', 'admin'].includes(member.role)) return { error: 'Sin permisos para invitar.' }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: invite, error } = await (supabase as any)
    .from('org_invitations')
    .insert({ organization_id: member.organization_id, invited_by: user.id, role })
    .select('token')
    .single() as { data: { token: string } | null; error: unknown }

  if (error || !invite) return { error: 'Error al crear la invitación.' }

  return { token: invite.token }
}

// ── CANCELAR INVITACIÓN ───────────────────────────────────────
export async function cancelInvitation(invitationId: string) {
  const supabase = createClient()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('org_invitations')
    .delete()
    .eq('id', invitationId)
  revalidatePath('/dashboard/team')
}

// ── CAMBIAR ROL ───────────────────────────────────────────────
export async function changeMemberRole(memberId: string, role: OrgRole) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: me } = await supabase
    .from('org_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single() as { data: MemberRow | null }

  if (!me || !['owner', 'admin'].includes(me.role)) return

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from('org_members')
    .update({ role })
    .eq('id', memberId)
    .eq('organization_id', me.organization_id)
    .neq('user_id', user.id)

  revalidatePath('/dashboard/team')
}

// ── ELIMINAR MIEMBRO ──────────────────────────────────────────
export async function removeMember(memberId: string) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: me } = await supabase
    .from('org_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single() as { data: MemberRow | null }

  if (!me || !['owner', 'admin'].includes(me.role)) return

  const { data: target } = await supabase
    .from('org_members')
    .select('role, user_id')
    .eq('id', memberId)
    .eq('organization_id', me.organization_id)
    .single() as { data: TargetRow | null }

  if (!target || target.role === 'owner' || target.user_id === user.id) return

  await supabase
    .from('org_members')
    .delete()
    .eq('id', memberId)

  revalidatePath('/dashboard/team')
}

// ── ACEPTAR INVITACIÓN ────────────────────────────────────────
export async function acceptInvitation(token: string): Promise<{ error?: string }> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?invite=${token}`)

  const admin = createAdminClient()

  const { data: invite, error: inviteError } = await admin
    .from('org_invitations')
    .select('id, organization_id, role, accepted_at, expires_at')
    .eq('token', token)
    .single()

  if (inviteError || !invite) return { error: 'Invitación inválida.' }
  if (invite.accepted_at) return { error: 'Esta invitación ya fue usada.' }
  if (new Date(invite.expires_at) < new Date()) return { error: 'La invitación expiró.' }

  const { data: existing } = await admin
    .from('org_members')
    .select('id')
    .eq('organization_id', invite.organization_id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    await admin
      .from('org_members')
      .insert({ organization_id: invite.organization_id, user_id: user.id, role: invite.role })
  }

  await admin
    .from('org_invitations')
    .update({ accepted_at: new Date().toISOString(), accepted_by: user.id })
    .eq('id', invite.id)

  revalidatePath('/dashboard')
  redirect('/dashboard')
}
