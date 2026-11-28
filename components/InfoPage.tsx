import type { ReactNode } from 'react'
import Link from 'next/link'

// Komponen bersama untuk halaman informasi forum: /tentang, /faq, /peraturan

const halamanInfo = [
  { href: '/tentang', label: 'Tentang' },
  { href: '/faq', label: 'FAQ' },
  { href: '/peraturan', label: 'Peraturan' },
] as const

export type HalamanInfo = (typeof halamanInfo)[number]['href']

export function InfoHero({
  badge,
  judul,
  deskripsi,
  aktif,
}: {
  badge: string
  judul: string
  deskripsi: string
  aktif: HalamanInfo
}) {
  const labelAktif = halamanInfo.find((h) => h.href === aktif)?.label

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-violet-300 transition-colors">
          Beranda
        </Link>
        <span>/</span>
        <span className="text-fuchsia-300 font-semibold">{labelAktif}</span>
      </nav>

      <section className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-violet-950/50 via-fuchsia-950/25 to-zinc-900/50 border border-white/[0.1] border-t-white/25 rounded-3xl p-8 sm:p-10 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-72 h-72 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/25 text-violet-200 text-xs font-semibold mb-3 backdrop-blur-md">
            {badge}
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2.5">
            {judul}
          </h1>
          <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed">{deskripsi}</p>
        </div>
      </section>

      <div className="flex flex-wrap gap-2" aria-label="Halaman informasi">
        {halamanInfo.map((h) => (
          <Link
            key={h.href}
            href={h.href}
            aria-current={h.href === aktif ? 'page' : undefined}
            className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
              h.href === aktif
                ? 'bg-violet-500/20 text-violet-200 border-violet-400/30'
                : 'bg-white/[0.03] text-slate-300 border-white/[0.09] hover:text-white hover:bg-white/[0.06]'
            }`}
          >
            {h.label}
          </Link>
        ))}
      </div>
    </div>
  )
}

export function InfoCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] border-t-white/20 rounded-3xl p-6 sm:p-8 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  )
}

export function InfoCta({ judul, teks }: { judul: string; teks: string }) {
  return (
    <div className="backdrop-blur-2xl bg-gradient-to-br from-violet-950/35 via-fuchsia-950/20 to-amber-950/15 border border-violet-400/25 border-t-white/15 rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
      <div>
        <h2 className="font-bold text-white text-lg mb-1">{judul}</h2>
        <p className="text-sm text-slate-300/80 leading-relaxed">{teks}</p>
      </div>
      <div className="flex flex-wrap gap-3 shrink-0">
        <Link
          href="/buat-thread"
          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/25 transition-all active:scale-95 border border-white/25"
        >
          + Buat Thread
        </Link>
        <Link
          href="/kategori"
          className="px-5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm border border-white/15 transition-all"
        >
          📂 Jelajahi Kategori
        </Link>
      </div>
    </div>
  )
}
