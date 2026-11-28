import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadCard } from '@/components/ThreadCard'
import { KontenTeks } from '@/components/KontenTeks'
import { BagikanTombol } from '@/components/BagikanTombol'
import { ViewCounter } from '@/components/ViewCounter'
import { VoteButton } from '@/components/VoteButton'
import { ReportButton } from '@/components/ReportButton'
import { CommentSection } from '@/components/CommentSection'
import { getCurrentUser } from '@/lib/session'
import {
  estimasiBaca,
  formatTanggalJam,
  inisial,
  waktuRelatif,
  warnaAvatar,
} from '@/lib/format'

const ID_MAKS = 2147483647 // batas Int di PostgreSQL

export default function ThreadDetailPage({ params }: PageProps<'/thread/[id]'>) {
  return (
    <PageShell>
      <Suspense fallback={<ThreadSkeleton />}>
        <ThreadDetail params={params} />
      </Suspense>
    </PageShell>
  )
}

async function ThreadDetail({ params }: Pick<PageProps<'/thread/[id]'>, 'params'>) {
  await connection() // data DB selalu diambil saat request, bukan saat build
  const { id: idMentah } = await params
  const id = Number(idMentah)
  if (!Number.isInteger(id) || id < 1 || id > ID_MAKS) notFound()

  let thread
  let terkait: Awaited<ReturnType<typeof ambilTerkait>> = []
  let user: Awaited<ReturnType<typeof getCurrentUser>> = null
  try {
    thread = await prisma.thread.findUnique({
      where: { id, deletedAt: null },
      include: {
        kategori: true,
        votes: { select: { userId: true } },
        comments: {
          where: { deletedAt: null },
          include: { user: { select: { username: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (thread) terkait = await ambilTerkait(thread.kategoriId, thread.id)
    user = await getCurrentUser()
  } catch {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 rounded-3xl bg-white/[0.03] border border-rose-500/30 p-8">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 w-12 h-12 rounded-full border border-rose-400/40 bg-rose-500/10 text-rose-300 flex items-center justify-center text-xl font-black"
        >
          !
        </div>
        <h1 className="font-semibold text-white mb-1">Gagal memuat diskusi</h1>
        <p className="text-sm text-slate-400 mb-5">
          Koneksi ke database bermasalah. Coba muat ulang halaman ini beberapa saat lagi.
        </p>
        <Link href="/" className="text-fuchsia-300 hover:text-amber-300 text-sm font-semibold">
          &larr; Kembali ke beranda
        </Link>
      </div>
    )
  }

  if (!thread) notFound()

  return (
    <div className="max-w-3xl mx-auto space-y-10">
      <ViewCounter threadId={thread.id} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 min-w-0">
        <Link href="/" className="hover:text-white transition-colors shrink-0">
          Beranda
        </Link>
        <span>/</span>
        <Link
          href={`/kategori/${encodeURIComponent(thread.kategori.slug)}`}
          className="hover:text-white transition-colors shrink-0"
        >
          {thread.kategori.nama}
        </Link>
        <span>/</span>
        <span className="truncate text-slate-300">{thread.judul}</span>
      </nav>

      <article className="backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] border-t-white/20 rounded-3xl p-6 sm:p-9 shadow-2xl">
        <Link
          href={`/kategori/${encodeURIComponent(thread.kategori.slug)}`}
          className="inline-block px-3 py-1 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 text-xs font-semibold border border-fuchsia-400/25 hover:bg-fuchsia-500/25 transition-colors"
        >
          # {thread.kategori.nama}
        </Link>

        <h1 className="mt-4 text-2xl sm:text-4xl font-black tracking-tight text-white break-words">
          {thread.judul}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-slate-400">
          <span className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-full bg-gradient-to-br ${warnaAvatar(thread.penulis)} flex items-center justify-center text-sm font-bold text-white border border-white/20`}
            >
              {inisial(thread.penulis)}
            </span>
            <span className="text-sm font-semibold text-slate-200">{thread.penulis}</span>
          </span>
          <time dateTime={thread.createdAt.toISOString()} title={formatTanggalJam(thread.createdAt)}>
            Diposting {waktuRelatif(thread.createdAt)}
          </time>
          <span>{thread.views} dilihat</span>
          <span>{estimasiBaca(thread.konten)} menit baca</span>
        </div>

        <p className="mt-1 text-[11px] text-slate-400">{formatTanggalJam(thread.createdAt)}</p>

        <hr className="my-6 border-white/[0.08]" />

        <KontenTeks teks={thread.konten} />

        {thread.gambarUrl && (
          <a
            href={thread.gambarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block"
            aria-label="Buka gambar ukuran penuh"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thread.gambarUrl}
              alt={`Gambar lampiran untuk diskusi: ${thread.judul}`}
              loading="lazy"
              className="max-h-[32rem] w-auto max-w-full rounded-2xl border border-white/[0.1]"
            />
          </a>
        )}

        <div className="mt-8 pt-6 border-t border-white/[0.08] flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-sm font-semibold text-slate-200 transition-all"
          >
            &larr; Kembali
          </Link>
          <div className="flex items-center gap-3">
            <VoteButton
              threadId={thread.id}
              totalCendol={thread.votes.length}
              sudahVote={user ? thread.votes.some((v) => v.userId === user.id) : false}
              sudahLogin={!!user}
            />
            <BagikanTombol judul={thread.judul} />
          </div>
        </div>
        <div className="mt-3 flex justify-end">
          <ReportButton targetType="THREAD" threadId={thread.id} />
        </div>
      </article>

      <CommentSection threadId={thread.id} komentar={thread.comments} sudahLogin={!!user} />

      {/* Thread terkait */}
      <section aria-labelledby="judul-terkait" className="space-y-4">
        <h2 id="judul-terkait" className="text-lg font-bold text-white">
          Diskusi lain di {thread.kategori.nama}
        </h2>
        {terkait.length > 0 ? (
          <div className="space-y-4">
            {terkait.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-white/[0.03] border border-dashed border-white/[0.15] p-6 text-sm text-slate-400">
            Belum ada diskusi lain di kategori ini.{' '}
            <Link href="/buat-thread" className="text-fuchsia-300 hover:text-amber-300 font-semibold">
              Jadi yang pertama membuat!
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}

function ambilTerkait(kategoriId: number, kecualiId: number) {
  return prisma.thread.findMany({
    where: { kategoriId, deletedAt: null, NOT: { id: kecualiId } },
    include: { kategori: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
}

function ThreadSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6" aria-busy="true">
      <div className="h-4 w-56 rounded bg-white/20"></div>
      <div className="rounded-3xl bg-white/[0.06] border border-white/[0.15] p-9 space-y-5">
        <div className="h-6 w-28 rounded-xl bg-white/20"></div>
        <div className="h-9 w-4/5 rounded bg-white/20"></div>
        <div className="h-9 w-48 rounded bg-white/20"></div>
        <div className="space-y-3 pt-4">
          <div className="h-4 rounded bg-white/20"></div>
          <div className="h-4 rounded bg-white/20"></div>
          <div className="h-4 w-2/3 rounded bg-white/20"></div>
        </div>
      </div>
    </div>
  )
}