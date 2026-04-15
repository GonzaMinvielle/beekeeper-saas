export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-400 rounded-2xl mb-4 shadow-lg">
            <span className="text-3xl">🐝</span>
          </div>
          <h1 className="text-2xl font-bold text-amber-900">Appicultor Pro</h1>
          <p className="text-amber-700 text-sm mt-1">Gestión inteligente de colmenas</p>
        </div>
        {children}
      </div>
    </div>
  )
}
