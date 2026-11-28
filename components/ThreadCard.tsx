import Link from 'next/link'
import { Highlight } from '@/components/Highlight'
import {
  ambilCuplikan,
  formatTanggal,
  inisial,
  warnaAvatar,
  warnaKategori,
} from '@/lib/format'

export type ThreadCardData = {
  id: number
  judul: string
  konten: string
  penulis: string
  views: number
  createdAt: Date
  gambarUrl?: string | null
  kategori: { nama: string } | null
}

function IkonMata() {
  return (
    <svg viewBox="0 0 20 20" className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <path d="M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10Z" />
      <circle cx="10" cy="10" r="2.5" />
    </svg>
  )
}

export function ThreadCard({
  thread,
  kataKunci = '',
  variant = 'row',
}: {
  thread: ThreadCardData
  kataKunci?: string
  variant?: 'row' | 'tile'
}) {
  const warna = warnaKategori(thread.kategori?.nama)
  const tile = variant === 'tile'

  return (
    <Link
      href={`/thread/${thread.id}`}
      className={`group flex bg-white border-2 border-ink rounded-xl overflow-hidden shadow-hard-sm transition-all hover:-translate-y-0.5 hover:shadow-hard ${
        tile ? 'flex-col' : ''
      }`}
    >
      {tile && thread.gambarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thread.gambarUrl}
          alt=""
          loading="lazy"
          className="h-52 w-full object-cover border-b-2 border-ink"
        />
      )}
      {tile ? <div className={`h-2 ${warna.bar}`} /> : <div className={`w-2 shrink-0 ${warna.bar}`} />}

      <div className={`flex-1 min-w-0 ${tile ? 'p-5 sm:p-6' : 'p-4 sm:p-5'}`}>
        <div className="flex items-center justify-between gap-3 text-xs text-ink/60 mb-2.5">
          <span className={`px-2.5 py-0.5 rounded-md border font-bold ${warna.chip}`}>
            {thread.kategori?.nama ?? 'Umum'}
          </span>
          <time dateTime={thread.createdAt.toISOString()}>{formatTanggal(thread.createdAt)}</time>
        </div>

        <h3
          className={`font-bold text-ink group-hover:text-cobalt transition-colors break-words leading-snug ${
            tile ? 'text-2xl sm:text-3xl mb-3' : 'text-lg sm:text-xl mb-1.5'
          }`}
        >
          <Highlight teks={thread.judul} kataKunci={kataKunci} />
        </h3>
        <p
          className={`text-sm text-ink/70 leading-relaxed break-words ${
            tile ? 'line-clamp-4 mb-4' : 'line-clamp-2 mb-3'
          }`}
        >
          <Highlight
            teks={ambilCuplikan(thread.konten, kataKunci, tile ? 260 : 180)}
            kataKunci={kataKunci}
          />
        </p>

        <div className="flex items-center justify-between gap-3 text-xs text-ink/60">
          <span className="flex items-center gap-2 min-w-0">
            <span
              className={`w-6 h-6 shrink-0 rounded-full border-2 border-ink flex items-center justify-center text-[11px] font-bold ${warnaAvatar(thread.penulis)}`}
            >
              {inisial(thread.penulis)}
            </span>
            <span className="truncate font-semibold text-ink">
              <Highlight teks={thread.penulis} kataKunci={kataKunci} />
            </span>
            <span className="shrink-0 inline-flex items-center gap-1">
              <IkonMata /> {thread.views}
            </span>
          </span>
          <span className="shrink-0 font-bold text-cobalt group-hover:translate-x-1 transition-transform">
            Baca &rarr;
          </span>
        </div>
      </div>

      {!tile && thread.gambarUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thread.gambarUrl}
          alt=""
          loading="lazy"
          className="hidden sm:block w-32 shrink-0 object-cover border-l-2 border-ink"
        />
      )}
    </Link>
  )
}