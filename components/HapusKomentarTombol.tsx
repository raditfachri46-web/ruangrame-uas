'use client'

import { hapusKomentar } from '@/app/thread/[id]/actions'

export function HapusKomentarTombol({ commentId }: { commentId: number }) {
  return (
    <form
      action={hapusKomentar.bind(null, commentId)}
      onSubmit={(e) => {
        if (!confirm('Hapus komentar ini?')) e.preventDefault()
      }}
    >
      <button
        type="submit"
        className="text-xs font-semibold text-rose-300 hover:text-rose-200 transition-colors"
      >
        Hapus
      </button>
    </form>
  )
}