'use client'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <p className="text-6xl mb-4">🐝</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Sin conexión</h1>
        <p className="text-gray-500 text-sm mb-6">
          No hay conexión a Internet. Las páginas que visitaste recientemente
          siguen disponibles mientras tanto.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-semibold
                     text-sm rounded-xl transition-colors"
        >
          Reintentar
        </button>
      </div>
    </div>
  )
}
