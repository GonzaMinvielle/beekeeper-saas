import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import DiseaseSearch from './DiseaseSearch'
import type { DiseaseEntry } from '@/lib/types/database.types'

async function getDiseases() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data } = await supabase
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('disease_library' as any)
    .select('*')
    .order('severity', { ascending: false })
    .order('name')

  return (data as unknown as DiseaseEntry[]) ?? []
}

export default async function DiseasesPage() {
  const diseases = await getDiseases()

  const byHighSeverity = diseases.filter((d) => d.severity === 'high').length
  const byMedSeverity  = diseases.filter((d) => d.severity === 'medium').length
  const byLowSeverity  = diseases.filter((d) => d.severity === 'low').length

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <Link href="/dashboard/community" className="text-sm text-amber-600 hover:text-amber-700 font-medium mb-1 block">
            ← Volver al foro
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Biblioteca de Enfermedades</h1>
          <p className="text-gray-500 text-sm mt-1">
            Guía de referencia de las principales enfermedades y plagas apícolas
          </p>
        </div>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-red-600">{byHighSeverity}</p>
          <p className="text-xs text-red-600 font-medium mt-0.5">Gravedad alta</p>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-yellow-600">{byMedSeverity}</p>
          <p className="text-xs text-yellow-600 font-medium mt-0.5">Gravedad media</p>
        </div>
        <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-green-600">{byLowSeverity}</p>
          <p className="text-xs text-green-600 font-medium mt-0.5">Gravedad baja</p>
        </div>
      </div>

      <DiseaseSearch diseases={diseases} />
    </div>
  )
}
