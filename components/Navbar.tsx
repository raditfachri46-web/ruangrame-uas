import { Suspense, type ReactNode } from 'react'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/session'
import { logoutUser } from '@/app/actions/auth'
import { NotificationBell } from '@/components/NotificationBell'
import { NavLinks } from '@/components/NavLinks'
import { Logo } from '@/components/Logo'

const linkTambahan =
  'px-3 py-1.5 rounded-lg text-sm font-semibold text-ink hover:bg-sun transition-colors whitespace-nowrap'

type NavbarProps = {
  isConnected?: boolean
  aksi?: ReactNode
}

function KerangkaNavbar() {
  return (
    <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Logo />
      </div>
    </header>
  )
}

async function NavbarIsi({ isConnected, aksi }: NavbarProps) {
  const user = await getCurrentUser()

  return (
    <header className="sticky top-0 z-50 bg-paper border-b-2 border-ink">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-5 gap-y-3">
        <Logo />

        <div className="order-3 lg:order-none w-full lg:w-auto overflow-x-auto -mx-1 px-1 flex items-center gap-1">
          <NavLinks />
          <Link href="/leaderboard" className={linkTambahan}>
            Leaderboard
          </Link>
          {(user?.role === 'MODERATOR' || user?.role === 'ADMIN') && (
            <Link href="/moderasi" className={linkTambahan}>
              Moderasi
            </Link>
          )}
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

          {user && <NotificationBell userId={user.id} />}

          {aksi}

          <Link
            href="/buat-thread"
            className="btn-hard rounded-lg bg-cobalt text-white font-bold text-sm px-4 py-2 whitespace-nowrap"
          >
            + Buat Thread
          </Link>

          {user ? (
            <div className="hidden sm:flex items-center gap-2">
              <span className="rounded-lg bg-sun border-2 border-ink px-3 py-1.5 text-xs font-bold text-ink">
                @{user.username}
              </span>
              <form action={logoutUser}>
                <button
                  type="submit"
                  className="btn-hard rounded-lg bg-white text-ink font-bold text-xs px-3 py-1.5"
                >
                  Logout
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="btn-hard rounded-lg bg-white text-ink font-bold text-xs px-3 py-1.5"
              >
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export function Navbar(props: NavbarProps) {
  return (
    <Suspense fallback={<KerangkaNavbar />}>
      <NavbarIsi {...props} />
    </Suspense>
  )
}