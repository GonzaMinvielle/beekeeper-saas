import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import type { Apiary, FloweringEntry } from '@/lib/types/database.types'
import ConfirmDeleteButton from '@/components/ui/ConfirmDeleteButton'
import { deleteFlowering } from '@/lib/actions/flowering'
import WeatherSection from './WeatherSection'
import FloweringForm from './FloweringForm'

const MONTHS = ['','Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function isCurrentlyFlowering(start: number, end: number): boolean {
  const now = new Date().getMonth() + 1
  if (start <= end) return now >= start && now <= end
  return now >= start || now <= end  // cruza el año (ej: nov → feb)
}

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

  const [apiariesRes, floweringRes] = await Promise.all([
    supabase
      .from('apiaries')
      .select('id, name, latitude, longitude, location')
      .eq('organization_id', member.organization_id)
      .order('name'),
    supabase
      .from('flowering_calendar')
      .select('*')
      .eq('organization_id', member.organization_id)
      .order('start_month'),
  ])

  return {
    apiaries:  (apiariesRes.data as Apiary[]) ?? [],
    flowering: (floweringRes.data as FloweringEntry[]) ?? [],
  }
}

export default async function WeatherPage() {
  const { apiaries, flowering } = await getData()

  const activeFlowering = flowering.filter((f) => isCurrentlyFlowering(f.start_month, f.end_month))

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Clima y Floración</h1>
        <p className="text-gray-500 text-sm mt-1">Condiciones meteorológicas y calendario floral</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Clima */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Clima actual por apiario</h2>
          <WeatherSection apiaries={apiaries} />
        </div>

        {/* Floración activa */}
        <div className="space-y-4">
          <h2 className="font-semibold text-gray-900">Floración activa este mes</h2>
          {activeFlowering.length === 0 ? (
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-6 text-center text-gray-400 text-sm">
              <p className="text-2xl mb-2">🌸</p>
              No hay plantas en floración este mes según el calendario.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm divide-y divide-gray-50">
              {activeFlowering.map((f) => (
                <div key={f.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-xl">🌸</span>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 text-sm">{f.plant_name}</p>
                    <p className="text-xs text-gray-500">
                      {MONTHS[f.start_month]} – {MONTHS[f.end_month]}
                      {f.region && ` · ${f.region}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Calendario floral completo */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div className="p-5 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Calendario floral</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Registrá qué plantas florecen en tu zona para planificar la temporada.
          </p>
        </div>

        <FloweringForm />

        {flowering.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            No hay plantas en el calendario todavía.
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {flowering.map((f) => {
              const active = isCurrentlyFlowering(f.start_month, f.end_month)
              return (
                <li key={f.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{active ? '🌸' : '🌿'}</span>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-900 text-sm">{f.plant_name}</p>
                        {active && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                            Activa
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500">
                        {MONTHS[f.start_month]} – {MONTHS[f.end_month]}
                        {f.region && ` · ${f.region}`}
                        {f.notes && ` · ${f.notes}`}
                      </p>
                    </div>
                  </div>
                  <ConfirmDeleteButton
                    action={deleteFlowering.bind(null, f.id)}
                    message={`¿Eliminar ${f.plant_name} del calendario?`}
                    className="text-xs text-red-400 hover:text-red-600 px-2 py-1 rounded"
                  >
                    Eliminar
                  </ConfirmDeleteButton>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
