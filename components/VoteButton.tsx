import { toggleVote } from '@/app/thread/[id]/actions'

export function VoteButton({
  threadId,
  totalCendol,
  sudahVote,
  sudahLogin,
}: {
  threadId: number
  totalCendol: number
  sudahVote: boolean
  sudahLogin: boolean
}) {
  if (!sudahLogin) {
    return (
      <span className="px-4 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-sm font-semibold text-slate-400 flex items-center gap-2">
        🌱 {totalCendol}
      </span>
    )
  }

  return (
    <form action={toggleVote.bind(null, threadId)}>
      <button
        type="submit"
        aria-pressed={sudahVote}
        className={`px-4 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 transition-all border ${
          sudahVote
            ? 'bg-emerald-500/20 border-emerald-400/40 text-emerald-200'
            : 'bg-white/[0.05] border-white/[0.1] text-slate-200 hover:bg-white/[0.1]'
        }`}
      >
        🌱 {totalCendol} {sudahVote ? 'Cendol diberikan' : 'Beri Cendol'}
      </button>
    </form>
  )
}
