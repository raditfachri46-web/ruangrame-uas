import Link from 'next/link'

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