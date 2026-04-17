'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCachedHives, type CachedHive } from '@/lib/offline/db'
import InspectionForm from './InspectionForm'

export default function NewInspectionPage() {
  const [hives, setHives] = useState<CachedHive[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      if (navigator.onLine) {
        try {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) { router.push('/login'); return }

          const { data: memberData } = await supabase
            .from('org_members')
            .select('organization_id')
            .eq('user_id', user.id)
            .single()

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const member = memberData as { organization_id: string } | null
          if (!member) { router.push('/dashboard'); return }

          const { data } = await supabase
            .from('hives')
            .select('id, name, code, status, apiaries(name)')
            .eq('organization_id', member.organization_id)
            .eq('status', 'active')
            .order('name')

          if (data) {
            setHives(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (data as any[]).map((h): CachedHive => ({
                id: h.id,
                name: h.name,
                code: h.code ?? null,
                apiary_name: h.apiaries?.name ?? null,
                status: h.status,
              }))
            )
          }
        } catch {
          // Caer a caché si falla la red
          const cached = await getCachedHives().catch(() => [] as CachedHive[])
          setHives(cached)
        }
      } else {
        const cached = await getCachedHives().catch(() => [] as CachedHive[])
        setHives(cached)
      }
      setLoading(false)
    }

    load()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-xl">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-6" />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (hives.length === 0) {
    return (
      <div className="max-w-xl">
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-12 text-center">
          <span className="text-5xl block mb-3">🏡</span>
          <p className="text-gray-500 text-sm">
            {navigator.onLine
              ? 'No hay colmenas activas. Creá una primero.'
              : 'Sin colmenas cacheadas offline. Conectate para sincronizar.'}
          </p>
        </div>
      </div>
    )
  }

  return <InspectionForm hives={hives} />
}
