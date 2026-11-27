import { Suspense } from 'react'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ReportCard } from '@/components/ReportCard'

export const metadata = {
  title: 'Panel Moderasi',
}

export default function ModerasiPage() {
  return (
    <PageShell>
      <Suspense fallback={<ModerasiSkeleton />}>
        <AntreanLaporan />
      </Suspense>
    </PageShell>
  )
}

async function AntreanLaporan() {
  await connection()

  const laporan = await prisma.report.findMany({
    where: { status: { in: ['PENDING', 'REVIEWED'] } },
    include: {
      reporter: { select: { username: true } },
      thread: { select: { id: true, judul: true } },
      comment: { select: { id: true, content: true, threadId: true } },
    },
    orderBy: { createdAt: 'asc' },
  })

  const riwayat = await prisma.report.findMany({
    where: { status: { in: ['RESOLVED', 'REJECTED'] } },
    include: {
      reporter: { select: { username: true } },
      thread: { select: { id: true, judul: true } },
      comment: { select: { id: true, content: true, threadId: true } },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 10,
  })

  return (
    <div className="max-w-2xl mx-auto space-y-10">
      <div>
        <h1 className="text-2xl font-black text-white">🛡️ Panel Moderasi</h1>
        <p className="text-sm text-slate-400 mt-1">
          Tinjau laporan konten yang melanggar aturan forum.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-fuchsia-300">
          Menunggu ditinjau ({laporan.length})
        </h2>
        {laporan.length === 0 ? (
          <div className="text-center py-12 rounded-3xl bg-white/[0.03] border border-white/[0.09] text-sm text-slate-400">
            Tidak ada laporan yang menunggu. 🎉
          </div>
        ) : (
          <div className="space-y-4">
            {laporan.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>

      {riwayat.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
            Riwayat terakhir
          </h2>
          <div className="space-y-4">
            {riwayat.map((r) => (
              <ReportCard key={r.id} report={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

function ModerasiSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-4" aria-busy="true">
      <div className="h-8 w-56 rounded bg-white/10" />
      {[1, 2].map((i) => (
        <div key={i} className="h-40 rounded-3xl bg-white/[0.04] border border-white/[0.08]" />
      ))}
    </div>
  )
}
