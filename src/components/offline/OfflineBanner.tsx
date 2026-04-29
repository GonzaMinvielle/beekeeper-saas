'use client'

import { useOfflineSync } from './OfflineSyncContext'

export default function OfflineBanner() {
  const { isOnline, isSyncing, syncFailed, pendingCount, retrySync } = useOfflineSync()

  if (isOnline && pendingCount === 0) return null

  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-xl shadow-lg
                     text-sm font-medium flex items-center gap-2
                     ${isOnline ? (syncFailed ? 'bg-red-600' : 'bg-green-600') : 'bg-gray-800'}
                     text-white`}>
      {!isOnline ? (
        <>
          <span>📵</span>
          Sin conexión — los datos se guardarán localmente
          {pendingCount > 0 && ` (${pendingCount} pendiente${pendingCount > 1 ? 's' : ''})`}
        </>
      ) : isSyncing ? (
        <>
          <span className="animate-spin inline-block">🔄</span>
          Sincronizando {pendingCount} inspección{pendingCount > 1 ? 'es' : ''}...
        </>
      ) : syncFailed ? (
        <>
          <span>⚠️</span>
          {pendingCount} inspección{pendingCount > 1 ? 'es' : ''} sin sincronizar
          <button
            onClick={retrySync}
            className="ml-2 underline text-white/90 hover:text-white text-xs"
          >
            Reintentar
          </button>
        </>
      ) : (
        <>
          <span className="animate-spin inline-block">🔄</span>
          Sincronizando {pendingCount} inspección{pendingCount > 1 ? 'es' : ''}...
        </>
      )}
    </div>
  )
}
