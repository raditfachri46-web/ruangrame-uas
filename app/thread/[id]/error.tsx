'use client'

import Link from 'next/link'

export default function ThreadError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen bg-[#09080f] text-slate-100 flex items-center justify-center px-6">
      <div className="max-w-md text-center rounded-3xl bg-white/[0.03] border border-rose-500/30 p-8">
        <div className="text-3xl mb-3">⚠️</div>
        <h1 className="font-bold text-white mb-2">Terjadi kesalahan</h1>
        <p className="text-sm text-slate-400 mb-6">Halaman diskusi gagal dimuat. Coba lagi ya.</p>
        <div className="flex justify-center gap-3">
          <button
            onClick={reset}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white"
          >
            Coba lagi
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-white/[0.05] border border-white/[0.1] text-sm font-semibold text-slate-200"
          >
            Beranda
          </Link>
        </div>
      </div>
    </div>
  )
}
