'use client'

import { useState, useEffect } from 'react'
import { getPendingInspections } from '@/lib/offline/db'

export default function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true)
  const [pendingCount, setPendingCount] = useState(0)

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

  // Poll mientras esté online con pendientes para detectar cuando termina el sync
  useEffect(() => {
    if (!isOnline || pendingCount === 0) return
    const interval = setInterval(() => {
      getPendingInspections()
        .then((list) => setPendingCount(list.length))
        .catch(() => {})
    }, 1500)
    return () => clearInterval(interval)
  }, [isOnline, pendingCount])

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
