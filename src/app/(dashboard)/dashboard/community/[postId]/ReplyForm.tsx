'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { createReply } from '@/lib/actions/community'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300
                 text-white font-semibold text-sm rounded-lg transition-colors"
    >
      {pending ? '...' : 'Responder'}
    </button>
  )
}

export default function ReplyForm({ postId }: { postId: string }) {
  const boundAction = createReply.bind(null, postId)
  const [state, action] = useFormState(boundAction, {} as { error?: string })

  return (
    <form action={action} className="space-y-3">
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <textarea
        name="content"
        required
        rows={3}
        placeholder="Escribí tu respuesta..."
        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none
                   focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
      />
      <SubmitButton />
    </form>
  )
}
