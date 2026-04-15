'use client'

import { useEffect, useCallback } from 'react'
import { getPendingInspections, deletePendingInspection } from './db'

// Envía las inspecciones offline pendientes cuando el dispositivo recupera conexión.
// Llama a la Server Action a través de un endpoint fetch (Server Actions no son
// invocables directamente desde el SW, así que usamos una API route ligera).
export function useOfflineSync() {
  const sync = useCallback(async () => {
    if (!navigator.onLine) return

    let pending
    try {
      pending = await getPendingInspections()
    } catch {
      return // IndexedDB no disponible
    }

    if (pending.length === 0) return

    for (const insp of pending) {
      try {
        const res = await fetch('/api/offline/sync-inspection', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(insp),
        })
        if (res.ok) {
          await deletePendingInspection(insp.id)
          console.log(`[offline-sync] Inspección ${insp.id} sincronizada.`)
        }
      } catch {
        // Aún sin conexión — reintentar en el próximo evento online
      }
    }
  }, [])

  useEffect(() => {
    sync()                                      // Intentar al montar
    window.addEventListener('online', sync)
    return () => window.removeEventListener('online', sync)
  }, [sync])
}
