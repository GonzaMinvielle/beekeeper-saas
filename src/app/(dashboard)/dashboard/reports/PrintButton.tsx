'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="px-4 py-2 border border-gray-300 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-50 transition-colors print:hidden"
    >
      🖨️ Imprimir / PDF
    </button>
  )
}
