import Link from 'next/link'
import { connection } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { logoutUser } from '@/app/actions/auth'
import { NotificationBell } from '@/components/NotificationBell'

// Bagian Navbar yang baca cookies()/DB (dinamis per-user). Dipisah dari Navbar.tsx + dibungkus <Suspense> supaya shell statis

export async function NavbarUserArea() {
  await connection()
  const user = await getCurrentUser()

  return (
    <>
      {(user?.role === 'MODERATOR' || user?.role === 'ADMIN') && (
        <Link
          href="/moderasi"
          className="px-3.5 py-2 rounded-full text-amber-300 hover:text-amber-200 hover:bg-amber-500/10 transition-all text-xs font-semibold"
        >
          🛡️ Moderasi
        </Link>
      )}

      {user && <NotificationBell userId={user.id} />}

      {user ? (
        <div className="hidden sm:flex items-center gap-2">
          <span className="px-3.5 py-2 rounded-full bg-fuchsia-500/15 border border-fuchsia-400/30 text-xs font-bold text-fuchsia-200">
            @{user.username}
          </span>
          <form action={logoutUser}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-full bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-xs font-semibold text-rose-200 transition"
            >
              Logout
            </button>
          </form>
        </div>
      ) : (
        <div className="hidden sm:flex items-center gap-2">
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-xs font-semibold text-white transition"
          >
            Login
          </Link>
        </div>
      )}
    </>
  )
}

// Fallback ringan selagi NavbarUserArea masih fetch cookie/DB
export function NavbarUserAreaFallback() {
  return (
    <div className="flex items-center gap-2 animate-pulse">
      <div className="hidden sm:block w-20 h-8 rounded-full bg-white/[0.06]" />
    </div>
  )
}
