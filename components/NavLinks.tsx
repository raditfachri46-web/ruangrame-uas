'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const TAUTAN = [
  { href: '/', label: 'Beranda' },
  { href: '/kategori', label: 'Kategori' },
  { href: '/tag-popular', label: 'Tag Populer' },
  { href: '/trending-topic', label: 'Trending' },
]

export function NavLinks() {
  const path = usePathname()

  return (
    <nav aria-label="Navigasi utama" className="flex items-center gap-1 text-sm font-semibold">
      {TAUTAN.map(({ href, label }) => {
        const aktif = href === '/' ? path === '/' : path.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            aria-current={aktif ? 'page' : undefined}
            className={`relative whitespace-nowrap px-3 py-2 rounded-lg transition-colors ${
              aktif ? 'text-ink' : 'text-ink/60 hover:text-ink'
            }`}
          >
            {label}
            <span
              aria-hidden
              className={`absolute left-3 right-3 bottom-1 h-[3px] rounded-full bg-sun transition-transform origin-left ${
                aktif ? 'scale-x-100' : 'scale-x-0'
              }`}
            />
          </Link>
        )
      })}
    </nav>
  )
}