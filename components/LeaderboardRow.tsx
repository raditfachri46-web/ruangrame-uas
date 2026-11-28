import { inisial, warnaAvatar } from '@/lib/format'
import type { PeringkatUser } from '@/lib/reputation'

const MEDALI = ['🥇', '🥈', '🥉']

export function LeaderboardRow({
  peringkat,
  data,
  isSayaSendiri = false,
}: {
  peringkat: number
  data: PeringkatUser
  isSayaSendiri?: boolean
}) {
  return (
    <div
      className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
        isSayaSendiri
          ? 'bg-fuchsia-500/[0.08] border-fuchsia-400/30'
          : 'bg-white/[0.03] border-white/[0.08]'
      }`}
    >
      <span className="w-8 shrink-0 text-center font-black text-slate-300">
        {MEDALI[peringkat - 1] ?? `#${peringkat}`}
      </span>

      <span
        className={`w-10 h-10 shrink-0 rounded-full bg-gradient-to-br ${warnaAvatar(data.username)} flex items-center justify-center text-sm font-bold text-white`}
      >
        {inisial(data.username)}
      </span>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-white truncate">
          @{data.username}
          {isSayaSendiri && <span className="ml-2 text-[10px] text-fuchsia-300">(kamu)</span>}
        </p>
        <p className="text-xs text-slate-400">
          🌱 {data.totalCendol} cendol &middot; 📝 {data.jumlahThread} thread &middot; 💬 {data.jumlahKomentar} komentar
        </p>
      </div>

      <span className="shrink-0 text-lg font-black bg-gradient-to-r from-violet-300 to-fuchsia-300 bg-clip-text text-transparent">
        {data.skor}
      </span>
    </div>
  )
}
