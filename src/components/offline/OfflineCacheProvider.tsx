'use client'

import { useEffect } from 'react'
import { cacheDataForOffline } from '@/lib/offline/cacheData'
import { getPendingInspections, deletePendingInspection } from '@/lib/offline/db'

async function syncPending() {
  if (!navigator.onLine) return
  let pending
  try { pending = await getPendingInspections() } catch { return }
  if (pending.length === 0) return

  for (const insp of pending) {
    try {
      const res = await fetch('/api/offline/sync-inspection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(insp),
      })
      if (res.ok) await deletePendingInspection(insp.id)
    } catch {
      // Sin conexión real — reintentar próximo evento online
    }
  }
}

export default function OfflineCacheProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (navigator.onLine) {
      cacheDataForOffline()
      syncPending()
    }

    const handleOnline = async () => {
      await syncPending()
      await cacheDataForOffline()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  return <>{children}</>
}
