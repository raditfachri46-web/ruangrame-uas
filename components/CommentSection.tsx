import { inisial, warnaAvatar, waktuRelatif } from '@/lib/format'
import { CommentForm } from '@/components/CommentForm'
import { ReportButton } from '@/components/ReportButton'
import { HapusKomentarTombol } from '@/components/HapusKomentarTombol'

export type KomentarData = {
  id: number
  content: string
  createdAt: Date
  userId: number
  user: { username: string }
}

export function CommentSection({
  threadId,
  komentar,
  sudahLogin,
  userIdSaatIni = null,
}: {
  threadId: number
  komentar: KomentarData[]
  sudahLogin: boolean
  userIdSaatIni?: number | null
}) {
  return (
    <section className="space-y-5">
      <h2 className="text-lg font-bold text-white">Komentar ({komentar.length})</h2>

      {sudahLogin ? (
        <CommentForm threadId={threadId} />
      ) : (
        <p className="text-sm text-slate-400">
          Mau ikut berkomentar?{' '}
          <a href="/login" className="text-fuchsia-300 hover:text-amber-300 font-semibold">
            Login dulu
          </a>
          .
        </p>
      )}

      {komentar.length === 0 ? (
        <p className="text-sm text-slate-500 italic">Belum ada komentar. Jadi yang pertama!</p>
      ) : (
        <div className="space-y-4">
          {komentar.map((k) => (
            <div
              key={k.id}
              id={`komentar-${k.id}`}
              className="flex gap-3 rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4"
            >
              <span
                className={`w-8 h-8 shrink-0 rounded-full bg-gradient-to-br ${warnaAvatar(k.user.username)} flex items-center justify-center text-xs font-bold text-white`}
              >
                {inisial(k.user.username)}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-200">@{k.user.username}</span>
                  <span className="text-[11px] text-slate-500">{waktuRelatif(k.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-300 mt-1 break-words whitespace-pre-wrap">
                  {k.content}
                </p>
                <div className="mt-2 flex items-center gap-4">
                  <ReportButton targetType="COMMENT" commentId={k.id} />
                  {userIdSaatIni !== null && k.userId === userIdSaatIni && (
                    <HapusKomentarTombol commentId={k.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}