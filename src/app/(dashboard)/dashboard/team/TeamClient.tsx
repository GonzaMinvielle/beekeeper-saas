'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useEffect, useRef, useState } from 'react'
import { createInvitation, cancelInvitation, removeMember, changeMemberRole } from '@/lib/actions/team'
import type { OrgMemberWithEmail, OrgInvitation, OrgRole } from '@/lib/types/database.types'

const ROLE_LABELS: Record<OrgRole, string> = {
  owner: 'Propietario',
  admin: 'Administrador',
  member: 'Miembro',
}

function InviteButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white text-sm font-semibold rounded-lg transition-colors"
    >
      {pending ? 'Generando...' : 'Generar link'}
    </button>
  )
}

function InvitePanel({ appUrl }: { appUrl: string }) {
  const [state, action] = useFormState(createInvitation, {})
  const prevToken = useRef<string | undefined>()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (state.token && state.token !== prevToken.current) {
      prevToken.current = state.token
      setCopied(false)
    }
  }, [state.token])

  function copyLink() {
    if (!state.token) return
    navigator.clipboard.writeText(`${appUrl}/invite/${state.token}`)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <h2 className="text-base font-semibold text-gray-900 mb-4">Invitar miembro</h2>

      {state.error && (
        <p className="mb-3 text-sm text-red-600">{state.error}</p>
      )}

      <form action={action} className="flex items-center gap-3 flex-wrap">
        <select
          name="role"
          defaultValue="member"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white
                     focus:outline-none focus:ring-2 focus:ring-amber-400"
        >
          <option value="admin">Administrador</option>
          <option value="member">Miembro</option>
        </select>
        <InviteButton />
      </form>

      {state.token && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-700 mb-2">
            Link generado (válido 7 días). Compartilo por WhatsApp o email:
          </p>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-xs bg-white border border-amber-200 rounded px-2 py-1.5 truncate">
              {appUrl}/invite/{state.token}
            </code>
            <button
              onClick={copyLink}
              className="shrink-0 px-3 py-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors"
            >
              {copied ? '✓ Copiado' : 'Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TeamClient({
  members,
  invitations,
  myRole,
  myUserId,
}: {
  members: OrgMemberWithEmail[]
  invitations: OrgInvitation[]
  myRole: string
  myUserId: string
}) {
  const canManage = ['owner', 'admin'].includes(myRole)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <h1 className="text-xl font-bold text-gray-900">Equipo</h1>

      {/* Miembros */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-900">
            Miembros ({members.length})
          </h2>
        </div>
        <ul className="divide-y divide-gray-100">
          {members.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-6 py-3">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {m.display_name ?? m.user_id.slice(0, 8)}
                  {m.user_id === myUserId && (
                    <span className="ml-2 text-xs text-gray-400">(vos)</span>
                  )}
                </p>
                <p className="text-xs text-gray-500">{ROLE_LABELS[m.role]}</p>
              </div>
              {canManage && m.user_id !== myUserId && m.role !== 'owner' && (
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={m.role}
                    onChange={(e) => changeMemberRole(m.id, e.target.value as OrgRole)}
                    className="text-xs px-2 py-1 border border-gray-200 rounded bg-white
                               focus:outline-none focus:ring-1 focus:ring-amber-400"
                  >
                    <option value="admin">Administrador</option>
                    <option value="member">Miembro</option>
                  </select>
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este miembro?')) removeMember(m.id)
                    }}
                    className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded
                               hover:bg-red-50 transition-colors"
                  >
                    Eliminar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>

      {/* Invitaciones pendientes */}
      {canManage && invitations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-base font-semibold text-gray-900">
              Invitaciones pendientes ({invitations.length})
            </h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex items-center justify-between px-6 py-3">
                <div>
                  <p className="text-sm text-gray-700">
                    Rol: <span className="font-medium">{ROLE_LABELS[inv.role]}</span>
                  </p>
                  <p className="text-xs text-gray-400">
                    Expira: {new Date(inv.expires_at).toLocaleDateString('es-AR')}
                  </p>
                </div>
                <button
                  onClick={() => cancelInvitation(inv.id)}
                  className="text-xs text-red-500 hover:text-red-700 px-2 py-1 rounded
                             hover:bg-red-50 transition-colors"
                >
                  Cancelar
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Generar invitación */}
      {canManage && <InvitePanel appUrl={appUrl} />}
    </div>
  )
}
