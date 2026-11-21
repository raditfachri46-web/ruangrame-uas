import Link from 'next/link'
import { Highlight } from '@/components/Highlight'
import { ambilCuplikan, formatTanggal, inisial, warnaAvatar } from '@/lib/format'

export type ThreadCardData = {
  id: number
  judul: string
  konten: string
  penulis: string
  views: number
  createdAt: Date
  kategori: { nama: string } | null
}

export function ThreadCard({
  thread,
  kataKunci = '',
}: {
  thread: ThreadCardData
  kataKunci?: string
}) {
  return (
    <Link
      href={`/thread/${thread.id}`}
      className="group block backdrop-blur-2xl bg-gradient-to-b from-white/[0.045] to-white/[0.02] hover:from-white/[0.07] hover:to-violet-950/20 border border-white/[0.09] border-t-white/15 hover:border-fuchsia-400/35 rounded-3xl p-6 transition-all shadow-xl"
    >
      <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
        <span className="px-3 py-1 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 font-semibold border border-fuchsia-400/25">
          {thread.kategori?.nama ?? 'Umum'}
        </span>
        <time dateTime={thread.createdAt.toISOString()}>{formatTanggal(thread.createdAt)}</time>
      </div>

      <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2 break-words">
        <Highlight teks={thread.judul} kataKunci={kataKunci} />
      </h3>
      <p className="text-sm text-slate-400 leading-relaxed mb-4 break-words">
        <Highlight teks={ambilCuplikan(thread.konten, kataKunci)} kataKunci={kataKunci} />
      </p>

      <div className="flex items-center justify-between pt-4 border-t border-white/[0.07] text-xs text-slate-400">
        <span className="flex items-center gap-2 min-w-0">
          <span
            className={`w-6 h-6 shrink-0 rounded-full bg-gradient-to-br ${warnaAvatar(thread.penulis)} flex items-center justify-center text-[11px] font-bold text-white`}
          >
            {inisial(thread.penulis)}
          </span>
          <span className="truncate font-medium text-slate-300">
            <Highlight teks={thread.penulis} kataKunci={kataKunci} />
          </span>
          <span className="shrink-0">&middot; 👁 {thread.views}</span>
        </span>
        <span className="shrink-0 text-fuchsia-400 group-hover:text-amber-300 font-semibold group-hover:translate-x-1.5 transition-all">
          Baca selengkapnya &rarr;
        </span>
      </div>
    </Link>
  )
}
