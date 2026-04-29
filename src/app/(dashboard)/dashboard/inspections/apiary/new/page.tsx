'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCachedApiaries, getCachedHives } from '@/lib/offline/db'
import ApiaryInspectionForm from './ApiaryInspectionForm'

type PartialHive = { id: string; name: string; code: string | null }
type ActiveSuper = { id: string; hive_id: string; placed_at: string }

export default function NewApiaryInspectionPage() {
  const searchParams = useSearchParams()
  const apiaryId = searchParams.get('apiary_id')
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [apiary, setApiary] = useState<{ id: string; name: string } | null>(null)
  const [hives, setHives] = useState<PartialHive[]>([])
  const [activeSupers, setActiveSupers] = useState<ActiveSuper[]>([])

  useEffect(() => {
    if (!apiaryId) { router.replace('/dashboard/apiaries'); return }
    const safeApiaryId: string = apiaryId

    async function load() {
      if (!navigator.onLine) {
        // Offline: load from IndexedDB
        const [cachedApiaries, cachedHives] = await Promise.all([
          getCachedApiaries().catch(() => []),
          getCachedHives().catch(() => []),
        ])
        const found = cachedApiaries.find(a => a.id === safeApiaryId)
        if (!found) { router.replace('/dashboard/apiaries'); return }
        setApiary(found)
        setHives(
          cachedHives
            .filter(h => h.apiary_id === safeApiaryId)
            .map(h => ({ id: h.id, name: h.name, code: h.code }))
        )
        setActiveSupers([]) // supers not cached offline — acceptable limitation
        setLoading(false)
        return
      }

      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.replace('/login'); return }

        const { data: memberData } = await supabase
          .from('org_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single()
        const member = memberData as { organization_id: string } | null
        if (!member) { router.replace('/login'); return }

        const [{ data: apiaryData }, { data: hivesData }] = await Promise.all([
          supabase
            .from('apiaries')
            .select('id, name')
            .eq('id', safeApiaryId)
            .eq('organization_id', member.organization_id)
            .single() as unknown as Promise<{ data: { id: string; name: string } | null }>,
          supabase
            .from('hives')
            .select('id, name, code, status')
            .eq('apiary_id', safeApiaryId)
            .eq('organization_id', member.organization_id)
            .eq('status', 'active')
            .order('name') as unknown as Promise<{ data: PartialHive[] | null }>,
        ])

        if (!apiaryData) { router.replace('/dashboard/apiaries'); return }
        setApiary(apiaryData)

        const hiveList = hivesData ?? []
        setHives(hiveList)

        if (hiveList.length > 0) {
          const hiveIds = hiveList.map(h => h.id)
          const { data: supersData } = await supabase
            .from('hive_supers' as never)
            .select('id, hive_id, placed_at')
            .in('hive_id', hiveIds)
            .is('removed_at', null) as { data: ActiveSuper[] | null }
          setActiveSupers(supersData ?? [])
        }
      } catch {
        router.replace('/dashboard/inspections')
      }
      setLoading(false)
    }

    load()
  }, [apiaryId, router])

  if (loading) {
    return (
      <div className="max-w-2xl space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-gray-100 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!apiary) return null

  return (
    <ApiaryInspectionForm
      apiaryId={apiary.id}
      apiaryName={apiary.name}
      hives={hives}
      activeSupers={activeSupers}
    />
  )
}
