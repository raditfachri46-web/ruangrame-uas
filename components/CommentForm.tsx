'use client'

import { useActionState } from 'react'
import { kirimKomentar, type KomentarState } from '@/app/thread/[id]/actions'

const initialState: KomentarState = {}

export function CommentForm({ threadId }: { threadId: number }) {
  const [state, formAction, isPending] = useActionState(kirimKomentar, initialState)

  return (
    <form action={formAction} className="space-y-3">
      <input type="hidden" name="threadId" value={threadId} />
      <textarea
        name="content"
        required
        rows={3}
        maxLength={2000}
        placeholder="Tulis komentar... (pakai @username untuk menyebut seseorang)"
        className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-fuchsia-400/50 transition-colors resize-none"
      />
      {state.error && <p className="text-xs text-rose-300">{state.error}</p>}
      <button
        type="submit"
        disabled={isPending}
        className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white text-sm font-semibold shadow-lg shadow-fuchsia-600/25 transition-all active:scale-95 disabled:opacity-50"
      >
        {isPending ? 'Mengirim...' : 'Kirim Komentar'}
      </button>
    </form>
  )
}
