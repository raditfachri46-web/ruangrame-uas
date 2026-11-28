import { Suspense } from 'react'
import Link from 'next/link'
import { NavbarUserArea, NavbarUserAreaFallback } from '@/components/NavbarUserArea'

export function Navbar({ isConnected }: { isConnected?: boolean }) {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09080f]/75 border-b border-white/[0.09] shadow-2xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <Link href="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-500/25 border border-white/25">
            R
          </div>
          <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent">
            RuangRame
          </span>
        </Link>

        <nav className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
          <Link href="/" className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
            Beranda
          </Link>
          <Link href="/kategori" className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
            Kategori
          </Link>
          <Link href="/tag-popular" className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
            Tag Populer
          </Link>
          <Link href="/trending-topic" className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
            Trending
          </Link>
          <Link href="/leaderboard" className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all">
            🏆 Leaderboard
          </Link>
        </nav>

        <form
          action="/search"
          method="GET"
          role="search"
          className="order-3 sm:order-none w-full sm:w-auto sm:flex-1 sm:max-w-md relative"
        >
          <label htmlFor="navbar-q" className="sr-only">
            Cari diskusi
          </label>
          <input
            id="navbar-q"
            name="q"
            type="search"
            maxLength={100}
            placeholder="Cari diskusi..."
            className="w-full rounded-2xl bg-white/[0.05] border border-white/[0.1] pl-4 pr-11 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none focus:border-fuchsia-400/50 focus:bg-white/[0.08] transition-colors"
          />
          <button
            type="submit"
            aria-label="Cari"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            🔍
          </button>
        </form>

        <div className="flex items-center gap-3">
          {isConnected !== undefined && (
            <div
              className={`hidden md:flex items-center space-x-2 px-3.5 py-2 rounded-full text-xs font-semibold border ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                }`}
              ></span>
              <span>{isConnected ? 'Database Connected' : 'Connection Error'}</span>
            </div>
          )}

          <Link
            href="/buat-thread"
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/25 transition-all active:scale-95 border border-white/25 whitespace-nowrap"
          >
            + Buat Thread
          </Link>

          <Suspense fallback={<NavbarUserAreaFallback />}>
            <NavbarUserArea />
          </Suspense>
        </div>
      </div>
    </header>
  )
}
