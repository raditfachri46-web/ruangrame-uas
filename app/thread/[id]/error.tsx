'use client'

import Link from 'next/link'

export default function ThreadError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-white text-ink flex items-center justify-center px-6">
      <div className="max-w-md text-center rounded-xl bg-white border border-coral/50 p-8">
        <div className="text-3xl mb-3">⚠️</div>
        <h1 className="font-bold text-ink mb-2">Terjadi kesalahan</h1>
        <p className="text-sm text-ink/65 mb-6">Halaman diskusi gagal dimuat. Coba lagi ya.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-lg bg-cobalt text-sm font-semibold text-white"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-white border border-ink/20 text-sm font-semibold text-ink"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}