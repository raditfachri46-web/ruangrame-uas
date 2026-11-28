import Link from 'next/link'

// Footer global RuangRame. Dipakai di PageShell dan halaman yang punya layout sendiri.
// Sengaja tanpa hook / akses data supaya aman dipakai di server component maupun client component.

const menuJelajahi = [
  { href: '/', label: 'Beranda' },
  { href: '/kategori', label: 'Kategori' },
  { href: '/tag-popular', label: 'Tag Populer' },
  { href: '/trending-topic', label: 'Trending' },
  { href: '/leaderboard', label: 'Leaderboard' },
]

const menuInfo = [
  { href: '/tentang', label: 'Tentang RuangRame' },
  { href: '/faq', label: 'FAQ' },
  { href: '/peraturan', label: 'Peraturan Forum' },
]

export function Footer() {
  return (
    <footer className="relative z-10 mt-auto border-t border-white/[0.07] bg-[#09080f]/60 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="sm:col-span-2 space-y-4">
          <Link href="/" className="inline-flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-lg text-white shadow-lg shadow-violet-500/25 border border-white/25">
              R
            </div>
            <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent">
              RuangRame
            </span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
            Forum diskusi kampus untuk bertanya tugas, membahas mata kuliah, dan berbagi info
            penting antar mahasiswa.
          </p>
          <Link
            href="/buat-thread"
            className="inline-flex px-4 py-2 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/15 text-xs font-semibold text-slate-200 hover:text-white transition-all"
          >
            + Mulai Diskusi
          </Link>
        </div>

        <nav aria-label="Jelajahi forum">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 mb-4">
            Jelajahi
          </h3>
          <ul className="space-y-2.5">
            {menuJelajahi.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Informasi forum">
          <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 mb-4">
            Informasi
          </h3>
          <ul className="space-y-2.5">
            {menuInfo.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-sm text-slate-400 hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/[0.05]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 text-center">
          <p>&copy; 2026 RuangRame &middot; Project Forum Diskusi Kampus.</p>
          <p>Tetap sopan, saling bantu, dan jaga diskusi tetap rame.</p>
        </div>
      </div>
    </footer>
  )
}
