import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { acceptInvitation } from '@/lib/actions/team'

export default async function InvitePage({
  params,
}: {
  params: { token: string }
}) {
  const { token } = params
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Validar invitación con admin client
  const admin = createAdminClient()
  const { data: invite } = await admin
    .from('org_invitations')
    .select('id, organization_id, role, accepted_at, expires_at, organizations(name)')
    .eq('token', token)
    .single()

  const orgName = (invite as { organizations?: { name?: string } })?.organizations?.name ?? 'un apiario'

  if (!invite) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-2xl mb-4">❌</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitación inválida</h1>
          <p className="text-sm text-gray-500">Este link no existe o fue cancelado.</p>
        </div>
      </div>
    )
  }

  if (invite.accepted_at || new Date(invite.expires_at) < new Date()) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-2xl mb-4">⏰</p>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Invitación expirada</h1>
          <p className="text-sm text-gray-500">Pedile al administrador que genere un nuevo link.</p>
        </div>
      </div>
    )
  }

  // Si no está logueado, redirigir a login/register con token
  if (!user) {
    redirect(`/register?invite=${token}`)
  }

  // Está logueado → aceptar directamente
  async function accept() {
    'use server'
    await acceptInvitation(token)
  }

  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-2xl mb-4 shadow-lg">
          <span className="text-3xl">🐝</span>
        </div>
        <h1 className="text-xl font-bold text-gray-900 mb-2">Invitación al equipo</h1>
        <p className="text-gray-500 text-sm mb-6">
          Fuiste invitado a unirte a <span className="font-semibold text-gray-800">{orgName}</span>.
        </p>
        <form action={accept}>
          <button
            type="submit"
            className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-600 text-white
                       font-semibold rounded-lg transition-colors"
          >
            Aceptar invitación
          </button>
        </form>
      </div>
    </div>
  )
}
