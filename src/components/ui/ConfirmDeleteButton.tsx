'use client'

export default function ConfirmDeleteButton({
  action,
  message = '¿Eliminar?',
  children,
  className,
}: {
  action: () => Promise<void>
  message?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <form action={action}>
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm(message)) e.preventDefault()
        }}
        className={className}
      >
        {children}
      </button>
    </form>
  )
}
