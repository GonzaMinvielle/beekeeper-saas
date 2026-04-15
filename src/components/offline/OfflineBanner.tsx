'use client'

import { useState, useEffect } from 'react'
import { getPendingInspections } from '@/lib/offline/db'
import { useOfflineSync } from '@/lib/offline/useSync'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

  useOfflineSync()

  useEffect(() => {
    setIsOnline(navigator.onLine)

    const onOnline  = () => { setIsOnline(true) }
    const onOffline = () => { setIsOnline(false) }

    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online',  onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    getPendingInspections()
      .then((list) => setPendingCount(list.length))
      .catch(() => {})
  }, [isOnline])

  if (isOnline && pendingCount === 0) return null

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg
                     text-sm font-medium flex items-center gap-2
                     ${isOnline
                       ? 'bg-green-600 text-white'
                       : 'bg-gray-800 text-white'
                     }`}>
      {!isOnline ? (
        <>
          <span>📵</span>
          Sin conexión — los datos se guardarán localmente
          {pendingCount > 0 && ` (${pendingCount} pendiente${pendingCount > 1 ? 's' : ''})`}
        </>
      ) : pendingCount > 0 ? (
        <>
          <span>🔄</span>
          Sincronizando {pendingCount} inspección{pendingCount > 1 ? 'es' : ''} guardada{pendingCount > 1 ? 's' : ''}...
        </>
      ) : null}
    </div>
  )
}
