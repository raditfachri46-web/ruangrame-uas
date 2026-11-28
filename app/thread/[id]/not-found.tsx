import Link from 'next/link'
import { PageShell } from '@/components/PageShell'

export default function ThreadNotFound() {
  return (
    <PageShell>
      <div className="max-w-xl mx-auto text-center py-16 rounded-xl bg-white border border-ink/20 p-8 shadow-hard-sm">
        <div className="w-14 h-14 rounded-lg bg-cobalt/10 border border-cobalt/40 flex items-center justify-center mx-auto mb-4 text-2xl">
          🔎
        </div>
        <h1 className="text-xl font-bold text-ink mb-2">Diskusi tidak ditemukan</h1>
        <p className="text-sm text-ink/65 mb-6 leading-relaxed">
          Thread yang kamu cari mungkin sudah dihapus atau linknya salah.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="px-5 py-2.5 rounded-lg bg-white hover:bg-paper border border-ink/20 text-sm font-semibold text-ink"
          >
            &larr; Ke beranda
          </Link>
          <Link
            href="/search"
            className="px-5 py-2.5 rounded-lg bg-cobalt text-sm font-semibold text-white"
          >
            Cari diskusi lain
          </Link>
        </div>
      </div>
    </PageShell>
  )
}