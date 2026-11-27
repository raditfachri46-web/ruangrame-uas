import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { PageShell } from '@/components/PageShell'
import { waktuRelatif, inisial, warnaAvatar } from '@/lib/format'
import { tandaiDibaca, tandaiSemuaDibaca } from './actions'

const IKON_TIPE: Record<string, string> = {
  REPLY: '💬',
  VOTE: '⬆️',
  MENTION: '📣',
  SYSTEM: '🛡️',
}

export const metadata = {
  title: 'Notifikasi',
}

export default function NotifikasiPage() {
  return (
    <PageShell>
      <Suspense fallback={<NotifSkeleton />}>
        <DaftarNotifikasi />
      </Suspense>
    </PageShell>
  )
}

async function DaftarNotifikasi() {
  await connection()
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const notifikasi = await prisma.notification.findMany({
    where: { userId: user.id },
    include: { actor: { select: { username: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  const belumDibaca = notifikasi.filter((n) => !n.isRead)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black text-white">🔔 Notifikasi</h1>
        {belumDibaca.length > 0 && (
          <form action={tandaiSemuaDibaca}>
            <button
              type="submit"
              className="px-3.5 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.1] text-xs font-semibold text-slate-200 transition-all"
            >
              Tandai semua dibaca
            </button>
          </form>
        )}
      </div>

      {notifikasi.length === 0 ? (
        <div className="text-center py-16 rounded-3xl bg-white/[0.03] border border-white/[0.09]">
          <div className="text-3xl mb-3">📭</div>
          <p className="text-sm text-slate-400">Belum ada notifikasi.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifikasi.map((n) => (
            <ItemNotifikasi key={n.id} notifikasi={n} />
          ))}
        </div>
      )}
    </div>
  )
}

function ItemNotifikasi({
  notifikasi: n,
}: {
  notifikasi: {
    id: number
    type: string
    message: string
    link: string | null
    isRead: boolean
    createdAt: Date
    actor: { username: string } | null
  }
}) {
  return (
    <form
      action={async () => {
        'use server'
        await tandaiDibaca(n.id)
        if (n.link) redirect(n.link)
      }}
    >
      <button
        type="submit"
        className={`w-full flex items-start gap-3 p-4 rounded-2xl border text-left transition-all ${
          n.isRead
            ? 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
            : 'bg-fuchsia-500/[0.07] border-fuchsia-400/25 hover:bg-fuchsia-500/[0.1]'
        }`}
      >
        {n.actor ? (
          <span
            className={`w-9 h-9 shrink-0 rounded-full bg-gradient-to-br ${warnaAvatar(n.actor.username)} flex items-center justify-center text-xs font-bold text-white`}
          >
            {inisial(n.actor.username)}
          </span>
        ) : (
          <span className="w-9 h-9 shrink-0 rounded-full bg-violet-500/20 border border-violet-400/30 flex items-center justify-center text-sm">
            {IKON_TIPE[n.type] ?? '🔔'}
          </span>
        )}
        <span className="flex-1 min-w-0">
          <span className={`block text-sm ${n.isRead ? 'text-slate-400' : 'text-slate-100 font-medium'}`}>
            {n.message}
          </span>
          <span className="block text-[11px] text-slate-500 mt-1">{waktuRelatif(n.createdAt)}</span>
        </span>
        {!n.isRead && <span className="w-2 h-2 rounded-full bg-fuchsia-400 mt-2 shrink-0" />}
      </button>
    </form>
  )
}

function NotifSkeleton() {
  return (
    <div className="max-w-2xl mx-auto animate-pulse space-y-3" aria-busy="true">
      <div className="h-8 w-40 rounded bg-white/10" />
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 rounded-2xl bg-white/[0.04] border border-white/[0.08]" />
      ))}
    </div>
  )
}
