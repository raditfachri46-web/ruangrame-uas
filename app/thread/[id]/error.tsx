'use client'

import Link from 'next/link'

// Halaman error tidak memakai PageShell karena SiteHeader membaca cookie di server.
export default function ThreadError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <h1 className="judul-lebar text-3xl">Thread gagal dimuat</h1>
      <p className="mt-3 text-pudar">Terjadi kesalahan di server. Coba muat ulang halaman ini.</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={reset} className="btn-utama">
          Muat ulang
        </button>
        <Link href="/" className="btn-tenang">
          Ke beranda
        </Link>
      </div>
    </div>
  )
}
