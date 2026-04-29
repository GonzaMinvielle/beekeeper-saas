'use client'

import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'
import { cacheDataForOffline } from '@/lib/offline/cacheData'
import {
  getPendingInspections, deletePendingInspection,
  getPendingApiaryInspections, deletePendingApiaryInspection,
  type PendingInspection, type PendingApiaryInspection,
} from '@/lib/offline/db'

type SyncState = {
  isOnline: boolean
  isSyncing: boolean
  syncFailed: boolean
  pendingCount: number
  retrySync: () => void
}

const OfflineSyncContext = createContext<SyncState>({
  isOnline: true,
  isSyncing: false,
  syncFailed: false,
  pendingCount: 0,
  retrySync: () => {},
})

export function useOfflineSync() {
  return useContext(OfflineSyncContext)
}

async function readPendingCount(): Promise<number> {
  const [hive, apiary] = await Promise.all([
    getPendingInspections().catch(() => [] as PendingInspection[]),
    getPendingApiaryInspections().catch(() => [] as PendingApiaryInspection[]),
  ])
  return hive.length + apiary.length
}

export function OfflineSyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline]       = useState(true)
  const [isSyncing, setIsSyncing]     = useState(false)
  const [syncFailed, setSyncFailed]   = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const syncingRef = useRef(false)

  const refreshCount = useCallback(async () => {
    const count = await readPendingCount()
    setPendingCount(count)
  }, [])

  const runSync = useCallback(async () => {
    if (syncingRef.current || !navigator.onLine) return
    syncingRef.current = true
    setIsSyncing(true)
    setSyncFailed(false)

    let failed = false

    // Sync hive inspections
    let pending: PendingInspection[] = []
    try { pending = await getPendingInspections() } catch { /* ignore */ }
    for (const insp of pending) {
      try {
        const res = await fetch('/api/offline/sync-inspection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insp),
        })
        if (res.ok) {
          await deletePendingInspection(insp.id)
        } else {
          failed = true
          console.error('[offline-sync] hive inspection failed:', await res.text())
        }
      } catch {
        failed = true
      }
    }

    // Sync apiary inspections
    let pendingApiary: PendingApiaryInspection[] = []
    try { pendingApiary = await getPendingApiaryInspections() } catch { /* ignore */ }
    for (const insp of pendingApiary) {
      try {
        const res = await fetch('/api/offline/sync-apiary-inspection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insp),
        })
        if (res.ok) {
          await deletePendingApiaryInspection(insp.id)
        } else {
          failed = true
          console.error('[offline-sync] apiary inspection failed:', await res.text())
        }
      } catch {
        failed = true
      }
    }

    await refreshCount()
    setSyncFailed(failed)
    setIsSyncing(false)
    syncingRef.current = false

    if (!failed) {
      await cacheDataForOffline()
    }
  }, [refreshCount])

  // Init
  useEffect(() => {
    setIsOnline(navigator.onLine)
    refreshCount()

    const onOnline  = () => { setIsOnline(true);  runSync() }
    const onOffline = () => { setIsOnline(false); setSyncFailed(false) }

    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [runSync, refreshCount])

  // Run sync on mount if online and there are pending items
  useEffect(() => {
    if (navigator.onLine) {
      readPendingCount().then(count => {
        if (count > 0) runSync()
        else cacheDataForOffline()
      })
    }
  }, [runSync])

  return (
    <OfflineSyncContext.Provider value={{ isOnline, isSyncing, syncFailed, pendingCount, retrySync: runSync }}>
      {children}
    </OfflineSyncContext.Provider>
  )
}
