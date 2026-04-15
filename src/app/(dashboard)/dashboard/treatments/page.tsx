import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { deleteMedication } from '@/lib/actions/treatments'
import type { Treatment, MedicationStock } from '@/lib/types/database.types'
import ConfirmDeleteButton from '@/components/ui/ConfirmDeleteButton'

type TreatmentWithHive = Treatment & { hives: { name: string } | null }

async function getData() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: member } = await supabase
    .from('org_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single() as { data: { organization_id: string } | null }
  if (!member) redirect('/dashboard')

  const [treatmentsRes, medsRes] = await Promise.all([
    supabase
      .from('treatments')
      .select('*, hives(name)')
      .eq('organization_id', member.organization_id)
      .order('applied_at', { ascending: false }),
    supabase
      .from('medications_stock')
      .select('*')
      .eq('organization_id', member.organization_id)
      .order('expiry_date', { ascending: true, nullsFirst: false }),
  ])

  return {
    treatments: (treatmentsRes.data as TreatmentWithHive[]) ?? [],
    medications: (medsRes.data as MedicationStock[]) ?? [],
  }
}

function expiryStatus(expiry: string | null): { label: string; color: string } | null {
  if (!expiry) return null
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0)  return { label: 'Vencido',        color: 'bg-red-100 text-red-700' }
  if (days <= 30) return { label: `Vence en ${days}d`, color: 'bg-orange-100 text-orange-700' }
  return { label: `Vence en ${days}d`, color: 'bg-green-100 text-green-700' }
}

export default async function TreatmentsPage() {
  const { treatments, medications } = await getData()

  const expiringSoon = medications.filter((m) => {
    if (!m.expiry_date) return false
    const days = Math.ceil((new Date(m.expiry_date).getTime() - Date.now()) / 86400000)
    return days <= 30
  })

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tratamientos y Sanidad</h1>
          <p className="text-gray-500 text-sm mt-1">{treatments.length} tratamiento{treatments.length !== 1 ? 's' : ''} registrado{treatments.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/treatments/medication/new"
            className="flex-1 sm:flex-none text-center px-4 py-2 border border-amber-400 text-amber-700 text-sm font-semibold rounded-lg hover:bg-amber-50 transition-colors">
            + Medicamento
          </Link>
          <Link href="/dashboard/treatments/new"
            className="flex-1 sm:flex-none text-center px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold rounded-lg transition-colors">
            + Tratamiento
          </Link>
        </div>
      </div>

      {/* Alertas de vencimiento */}
      {expiringSoon.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <p className="font-semibold text-orange-800 text-sm mb-2">
            ⚠️ Medicamentos próximos a vencer ({expiringSoon.length})
          </p>
          <ul className="space-y-1">
            {expiringSoon.map((m) => {
              const status = expiryStatus(m.expiry_date)
              return (
                <li key={m.id} className="flex items-center gap-2 text-sm text-orange-700">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status?.color}`}>
                    {status?.label}
                  </span>
                  <span className="font-medium">{m.product_name}</span>
                  <span className="text-orange-500">·</span>
                  <span>{m.quantity} {m.unit}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock de medicamentos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Stock de medicamentos</h2>
            <Link href="/dashboard/treatments/medication/new"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Agregar
            </Link>
          </div>
          {medications.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay medicamentos en stock.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {medications.map((m) => {
                const status = expiryStatus(m.expiry_date)
                return (
                  <li key={m.id} className="px-5 py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{m.product_name}</p>
                        {status && (
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.color}`}>
                            {status.label}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">{m.quantity} {m.unit}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/dashboard/treatments/medication/${m.id}`}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                        Editar
                      </Link>
                      <ConfirmDeleteButton
                        action={deleteMedication.bind(null, m.id)}
                        message="¿Eliminar este medicamento?"
                        className="text-xs text-red-400 hover:text-red-600"
                      >
                        Eliminar
                      </ConfirmDeleteButton>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {/* Lista de tratamientos */}
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Historial de tratamientos</h2>
            <Link href="/dashboard/treatments/new"
              className="text-sm text-amber-600 hover:text-amber-700 font-medium">
              + Nuevo
            </Link>
          </div>
          {treatments.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">
              No hay tratamientos registrados.
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {treatments.map((t) => {
                const date = new Date(t.applied_at + 'T12:00:00').toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'short', year: 'numeric',
                })
                const isNextCheckSoon = t.next_check_date &&
                  Math.ceil((new Date(t.next_check_date).getTime() - Date.now()) / 86400000) <= 7
                return (
                  <li key={t.id} className="px-5 py-3 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-gray-900 text-sm">{t.product_name}</p>
                          {t.dose && <span className="text-xs text-gray-500">({t.dose})</span>}
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t.hives?.name ?? '—'} · {date}
                        </p>
                        {t.next_check_date && (
                          <p className={`text-xs mt-0.5 font-medium ${isNextCheckSoon ? 'text-orange-600' : 'text-gray-400'}`}>
                            Próximo control: {new Date(t.next_check_date + 'T12:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                            {isNextCheckSoon && ' ⚠️'}
                          </p>
                        )}
                      </div>
                      <Link href={`/dashboard/treatments/${t.id}`}
                        className="text-xs text-amber-600 hover:text-amber-700 font-medium ml-3">
                        Ver →
                      </Link>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
