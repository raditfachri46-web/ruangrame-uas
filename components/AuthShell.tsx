import type { CSSProperties } from 'react'
import type { ReactNode } from 'react'
import { Logo } from '@/components/Logo'

const CATATAN = [
  { teks: 'Ada yang punya catatan Pemrograman Web minggu ini?', warna: 'bg-sun', miring: '-2deg' },
  { teks: 'Info: jadwal UAS bisa berubah, cek pengumuman prodi.', warna: 'bg-white', miring: '1.5deg' },
  { teks: 'Cari teman satu kelompok tugas akhir.', warna: 'bg-mint/40', miring: '-1deg' },
]

export function AuthShell({
  judul,
  deskripsi,
  bawah,
  children,
}: {
  judul: string
  deskripsi: string
  bawah: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-[1fr_1.05fr] text-ink">
      <aside className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12 border-r-2 border-ink">
        <Logo />
        <div>
          <h2 className="font-display font-extrabold text-5xl leading-[1.02] tracking-tight max-w-md">
            Pertanyaan yang biasanya mampir di grup chat, ada di sini.
          </h2>
          <ul className="mt-10 space-y-4 max-w-sm">
            {CATATAN.map((c, i) => (
              <li
                key={c.teks}
                className={`tempelan rounded-lg border-2 border-paper/80 px-4 py-3 text-sm font-semibold text-ink ${c.warna}`}
                style={{ ['--miring' as string]: c.miring, ['--urut' as string]: i } as CSSProperties}
              >
                {c.teks}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-paper/50">Contoh topik yang biasa dibahas di RuangRame.</p>
      </aside>

      <main className="flex items-center justify-center px-4 py-12 sm:px-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          <h1 className="font-display font-extrabold text-4xl leading-tight">{judul}</h1>
          <p className="mt-2 mb-8 text-ink/70">{deskripsi}</p>
          {children}
          <div className="mt-6 text-sm text-ink/70">{bawah}</div>
        </div>
      </main>
    </div>
  )
}