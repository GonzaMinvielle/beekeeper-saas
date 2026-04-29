'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCachedHives, getCachedApiaries, type CachedHive } from '@/lib/offline/db'
import InspectionForm from './InspectionForm'
import InspectionTypeSelector from './InspectionTypeSelector'

type Apiary = { id: string; name: string }

export default function NewInspectionPage() {
  const searchParams = useSearchParams()
  const type = searchParams.get('type')
  const apiaryId = searchParams.get('apiary_id')
  const router = useRouter()

  // Redirect to apiary form when type+apiary_id present
  useEffect(() => {
    if (type === 'apiary' && apiaryId) {
      router.replace(`/dashboard/inspections/apiary/new?apiary_id=${apiaryId}`)
    }
  }, [type, apiaryId, router])

  if (type === 'apiary' && apiaryId) {
    return <div className="max-w-xl"><div className="h-8 w-48 bg-gray-200 rounded animate-pulse" /></div>
  }

  if (type === 'hive') {
    return <HiveInspectionLoader />
  }

  return <SelectorLoader />
}

// ── Loads apiaries and renders the type selector ──────────────────────────

function SelectorLoader() {
  const [apiaries, setApiaries] = useState<Apiary[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      if (!navigator.onLine) {
        const cached = await getCachedApiaries().catch(() => [] as Apiary[])
        setApiaries(cached)
        setLoading(false)
        return
      }
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { router.push('/login'); return }

        const { data: memberData } = await supabase
          .from('org_members')
          .select('organization_id')
          .eq('user_id', user.id)
          .single()

        const member = memberData as { organization_id: string } | null
        if (!member) { router.push('/dashboard'); return }

        const { data } = await supabase
          .from('apiaries')
          .select('id, name')
          .eq('organization_id', member.organization_id)
          .order('name')

        setApiaries((data as Apiary[]) ?? [])
      } catch {
        setApiaries([])
      }
      setLoading(false)
    }
    load()
  }, [router])

  if (loading) {
    return (
      <div className="max-w-xl space-y-4">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-40 bg-gray-100 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  return <InspectionTypeSelector apiaries={apiaries} />
}

// ── Loads hives and renders the existing hive inspection form ─────────────

function HiveInspectionLoader() {
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

          const member = memberData as { organization_id: string } | null
          if (!member) { router.push('/dashboard'); return }

          const { data } = await supabase
            .from('hives')
            .select('id, name, code, status, apiary_id, apiaries(name)')
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
                apiary_id: h.apiary_id ?? null,
                apiary_name: h.apiaries?.name ?? null,
                status: h.status,
              }))
            )
          }
        } catch {
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
