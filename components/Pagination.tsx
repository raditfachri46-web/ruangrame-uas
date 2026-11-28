import Link from 'next/link'

function daftarHalaman(sekarang: number, total: number): (number | '...')[] {
  const hasil: (number | '...')[] = []
  for (let h = 1; h <= total; h++) {
    if (h === 1 || h === total || Math.abs(h - sekarang) <= 1) {
      hasil.push(h)
    } else if (hasil[hasil.length - 1] !== '...') {
      hasil.push('...')
    }
  }
  return hasil
}

export function Pagination({
  halaman,
  totalHalaman,
  buatHref,
}: {
  halaman: number
  totalHalaman: number
  buatHref: (halaman: number) => string
}) {
  if (totalHalaman <= 1) return null

  const dasar =
    'min-w-10 h-10 px-3 inline-flex items-center justify-center rounded-xl text-sm font-semibold border transition-colors'
  const aktif = 'bg-violet-600/40 border-fuchsia-400/50 text-white'
  const biasa = 'bg-white/[0.04] border-white/[0.09] text-slate-300 hover:text-white hover:border-fuchsia-400/35'
  const mati = 'bg-white/[0.02] border-white/[0.05] text-slate-600 pointer-events-none'

  return (
    <nav aria-label="Halaman" className="flex flex-wrap items-center justify-center gap-2 pt-4">
      <Link
        href={buatHref(Math.max(1, halaman - 1))}
        aria-disabled={halaman === 1}
        className={`${dasar} ${halaman === 1 ? mati : biasa}`}
      >
        &larr; Sebelumnya
      </Link>

      {daftarHalaman(halaman, totalHalaman).map((h, i) =>
        h === '...' ? (
          <span key={`titik-${i}`} className="px-1 text-slate-500">
            …
          </span>
        ) : (
          <Link
            key={h}
            href={buatHref(h)}
            aria-current={h === halaman ? 'page' : undefined}
            className={`${dasar} ${h === halaman ? aktif : biasa}`}
          >
            {h}
          </Link>
        )
      )}

      <Link
        href={buatHref(Math.min(totalHalaman, halaman + 1))}
        aria-disabled={halaman === totalHalaman}
        className={`${dasar} ${halaman === totalHalaman ? mati : biasa}`}
      >
        Berikutnya &rarr;
      </Link>
    </nav>
  )
}
