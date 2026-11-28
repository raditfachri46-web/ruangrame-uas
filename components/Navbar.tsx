import type { ReactNode } from 'react'
import Link from 'next/link'
import { NavLinks } from '@/components/NavLinks'

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group" aria-label="RuangRame, ke beranda">
      <svg
        viewBox="0 0 40 40"
        className="w-10 h-10 shrink-0 transition-transform group-hover:-rotate-6"
        aria-hidden
      >
        <path
          d="M4 6h22a3 3 0 0 1 3 3v13a3 3 0 0 1-3 3H15l-6 5v-5H4a3 3 0 0 1-3-3V9a3 3 0 0 1 3-3Z"
          fill="#2b3dea"
          stroke="#14173a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M18 16h18a3 3 0 0 1 3 3v11a3 3 0 0 1-3 3h-3v5l-6-5H18a3 3 0 0 1-3-3V19a3 3 0 0 1 3-3Z"
          fill="#ffd23f"
          stroke="#14173a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
      <span className="font-display font-extrabold text-2xl tracking-tight text-ink">
        RuangRame
      </span>
    </Link>
  )
}

export function Navbar({
  isConnected,
  aksi,
}: {
  isConnected?: boolean
  aksi?: ReactNode
}) {
  return (
    <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Logo />

        <div className="order-3 lg:order-none w-full lg:w-auto overflow-x-auto -mx-1 px-1">
          <NavLinks />
        </div>

        <form
          action="/search"
          method="GET"
          role="search"
          className="order-4 lg:order-none w-full lg:w-auto lg:flex-1 lg:max-w-sm relative lg:ml-auto"
        >
          <label htmlFor="navbar-q" className="sr-only">
            Cari diskusi
          </label>
          <input
            id="navbar-q"
            name="q"
            type="search"
            maxLength={100}
            placeholder="Cari tugas, matkul, info..."
            className="w-full rounded-lg bg-white border-2 border-ink pl-3.5 pr-11 py-2 text-sm text-ink placeholder:text-ink/45 outline-none focus:shadow-hard-sm transition-shadow"
          />
          <button
            type="submit"
            aria-label="Cari"
            className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 grid place-items-center rounded-md text-ink hover:bg-sun transition-colors"
          >
            <svg viewBox="0 0 20 20" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="m13 13 4 4" />
            </svg>
          </button>
        </form>

        <div className="ml-auto lg:ml-0 flex items-center gap-2.5">
          {isConnected !== undefined && (
            <span
              title={isConnected ? 'Database terhubung' : 'Koneksi database bermasalah'}
              className={`hidden xl:inline-flex items-center gap-1.5 text-xs font-semibold ${
                isConnected ? 'text-ink/60' : 'text-coral'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${isConnected ? 'bg-mint' : 'bg-coral'}`}
              />
              {isConnected ? 'Terhubung' : 'Koneksi bermasalah'}
            </span>
          )}
          {aksi}
          <Link
            href="/buat-thread"
            className="btn-hard rounded-lg bg-cobalt text-white font-bold text-sm px-4 py-2 whitespace-nowrap"
          >
            + Buat Thread
          </Link>
        </div>
      </div>
    </header>
  )
}