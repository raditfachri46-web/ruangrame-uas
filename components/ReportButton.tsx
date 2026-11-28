'use client'

import { useActionState, useState } from 'react'
import { buatLaporan, type LaporanState } from '@/app/actions/report'

const initialState: LaporanState = {}

export function ReportButton({
  targetType,
  threadId,
  commentId,
}: {
  targetType: 'THREAD' | 'COMMENT'
  threadId?: number
  commentId?: number
}) {
  const [terbuka, setTerbuka] = useState(false)
  const [state, formAction, isPending] = useActionState(buatLaporan, initialState)

  if (state.sukses) {
    return <p className="text-xs text-emerald-300">✅ Laporan terkirim, terima kasih.</p>
  }

  if (!terbuka) {
    return (
      <button
        type="button"
        onClick={() => setTerbuka(true)}
        className="text-xs text-slate-500 hover:text-rose-300 transition-colors"
      >
        🚩 Laporkan
      </button>
    )
  }

  return (
    <form action={formAction} className="mt-2 space-y-2 rounded-2xl bg-black/20 border border-white/[0.08] p-3">
      <input type="hidden" name="targetType" value={targetType} />
      {threadId && <input type="hidden" name="threadId" value={threadId} />}
      {commentId && <input type="hidden" name="commentId" value={commentId} />}

      <select
        name="reason"
        required
        className="w-full rounded-xl bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-xs text-white outline-none"
      >
        <option value="">Pilih alasan...</option>
        <option value="Spam">Spam</option>
        <option value="Ujaran kebencian">Ujaran kebencian</option>
        <option value="Konten dewasa">Konten dewasa</option>
        <option value="Pelecehan">Pelecehan</option>
        <option value="Lainnya">Lainnya</option>
      </select>

      <textarea
        name="description"
        rows={2}
        maxLength={500}
        placeholder="Detail tambahan (opsional)"
        className="w-full rounded-xl bg-white/[0.05] border border-white/[0.1] px-3 py-2 text-xs text-white placeholder:text-slate-500 outline-none resize-none"
      />

      {state.error && <p className="text-[11px] text-rose-300">{state.error}</p>}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isPending}
          className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-400/30 text-[11px] font-semibold text-rose-200 transition-all disabled:opacity-50"
        >
          {isPending ? 'Mengirim...' : 'Kirim Laporan'}
        </button>
        <button
          type="button"
          onClick={() => setTerbuka(false)}
          className="px-3 py-1.5 rounded-xl bg-white/[0.05] border border-white/[0.1] text-[11px] font-semibold text-slate-300 transition-all"
        >
          Batal
        </button>
      </div>
    </form>
  )
}
