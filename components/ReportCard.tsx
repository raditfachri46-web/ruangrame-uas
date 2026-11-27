import Link from 'next/link'
import { waktuRelatif } from '@/lib/format'
import { prosesLaporan } from '@/app/moderasi/actions'

const LABEL_STATUS: Record<string, string> = {
  PENDING: 'Menunggu',
  REVIEWED: 'Ditinjau',
  RESOLVED: 'Selesai',
  REJECTED: 'Ditolak',
}

export type ReportCardData = {
  id: number
  reason: string
  description: string | null
  status: string
  targetType: 'THREAD' | 'COMMENT'
  createdAt: Date
  reporter: { username: string }
  thread: { id: number; judul: string } | null
  comment: { id: number; content: string; threadId: number } | null
}

export function ReportCard({ report }: { report: ReportCardData }) {
  const linkKonten =
    report.targetType === 'THREAD' && report.thread
      ? `/thread/${report.thread.id}`
      : report.comment
        ? `/thread/${report.comment.threadId}#komentar-${report.comment.id}`
        : '#'

  const cuplikanKonten =
    report.targetType === 'THREAD' ? report.thread?.judul : report.comment?.content

  const sudahDiproses = report.status !== 'PENDING' && report.status !== 'REVIEWED'

  return (
    <div className="rounded-3xl bg-white/[0.03] border border-white/[0.09] p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="px-2.5 py-1 rounded-lg bg-amber-500/15 text-amber-300 text-[11px] font-bold border border-amber-400/25">
            {report.targetType === 'THREAD' ? 'THREAD' : 'KOMENTAR'}
          </span>
          <span className="ml-2 px-2.5 py-1 rounded-lg bg-white/[0.06] text-slate-300 text-[11px] font-semibold">
            {LABEL_STATUS[report.status] ?? report.status}
          </span>
        </div>
        <span className="text-[11px] text-slate-500 shrink-0">{waktuRelatif(report.createdAt)}</span>
      </div>

      <div>
        <p className="text-sm font-semibold text-white">Alasan: {report.reason}</p>
        {report.description && (
          <p className="text-sm text-slate-400 mt-1">{report.description}</p>
        )}
        <p className="text-xs text-slate-500 mt-2">Dilaporkan oleh @{report.reporter.username}</p>
      </div>

      <Link
        href={linkKonten}
        className="block rounded-2xl bg-black/20 border border-white/[0.07] p-3 text-xs text-slate-300 hover:border-fuchsia-400/30 transition-colors line-clamp-2"
      >
        &ldquo;{cuplikanKonten ?? 'Konten sudah tidak tersedia'}&rdquo;
      </Link>

      {!sudahDiproses && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/[0.07]">
          <form action={prosesLaporan.bind(null, report.id, 'hapus_konten')}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-400/30 text-xs font-semibold text-rose-200 transition-all"
            >
              🗑️ Hapus Konten
            </button>
          </form>
          <form action={prosesLaporan.bind(null, report.id, 'selesai')}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 text-xs font-semibold text-emerald-200 transition-all"
            >
              ✅ Tandai Selesai
            </button>
          </form>
          <form action={prosesLaporan.bind(null, report.id, 'tolak')}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-slate-300 transition-all"
            >
              ✖️ Tolak Laporan
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
