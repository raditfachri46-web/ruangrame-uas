import { Suspense } from 'react'
import { connection } from 'next/server'
import { PageShell } from '@/components/PageShell'
import { LeaderboardRow } from '@/components/LeaderboardRow'
import { ambilPeringkat } from '@/lib/reputation'
import { getCurrentUser } from '@/lib/session'

export const metadata = {
  title: 'Leaderboard',
}

export default function LeaderboardPage() {
  return (
    <PageShell>
      <Suspense fallback={<LeaderboardSkeleton />}>
        <DaftarPeringkat />
      </Suspense>
    </PageShell>
  )
}

async function DaftarPeringkat() {
  await connection()
  const [peringkat, user] = await Promise.all([ambilPeringkat(), getCurrentUser()])

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white">🏆 Leaderboard Reputasi</h1>
        <p className="text-sm text-slate-400 mt-1">
          Diurutkan dari total cendol dan kontribusi thread/komentar di forum.
        </p>
      </div>

      {peringkat.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white/[0.03] border border-white/[0.09]">
          <p className="text-sm text-slate-400">Belum ada data reputasi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {peringkat.map((p, i) => (
            <LeaderboardRow
              key={p.id}
              peringkat={i + 1}
              data={p}
              isSayaSendiri={user?.id === p.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function LeaderboardSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-3" aria-busy="true">
      <div className="h-8 w-64 rounded bg-white/10" />
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08]" />
      ))}
    </div>
  )
}
