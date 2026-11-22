import Link from 'next/link'
import { PageShell } from '@/components/PageShell'

export default function ThreadNotFound() {
  return (
    <PageShell>
      <div className="max-w-xl mx-auto text-center py-16 rounded-3xl bg-white/[0.03] border border-white/[0.09] p-8 shadow-2xl">
        <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4 text-2xl">
          🔎
        </div>
        <h1 className="text-xl font-bold text-white mb-2">Diskusi tidak ditemukan</h1>
        <p className="text-sm text-slate-400 mb-6 leading-relaxed">
          Thread yang kamu cari mungkin sudah dihapus atau linknya salah.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-sm font-semibold text-slate-200"
          >
            &larr; Ke beranda
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-sm font-semibold text-white"
          >
            Cari diskusi lain
          </Link>
        </div>
      </div>
    </PageShell>
  )
}
