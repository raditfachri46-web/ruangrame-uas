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
import {
  estimasiBaca,
  formatTanggalJam,
  inisial,
  waktuRelatif,
  warnaAvatar,
  warnaKategori,
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
  try {
    thread = await prisma.thread.findUnique({
      where: { id },
      include: { kategori: true },
    })
    if (thread) terkait = await ambilTerkait(thread.kategoriId, thread.id)
  } catch {
    return (
      <div className="max-w-3xl mx-auto text-center py-20 rounded-xl bg-white border border-coral/50 p-8">
        <div className="text-3xl mb-3">🔌</div>
        <h1 className="font-semibold text-ink mb-1">Gagal memuat diskusi</h1>
        <p className="text-sm text-ink/65 mb-5">
          Koneksi ke database bermasalah. Coba muat ulang halaman ini beberapa saat lagi.
        </p>
        <Link href="/" className="text-cobalt hover:text-ink text-sm font-semibold">
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
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-ink/65 min-w-0">
        <Link href="/" className="hover:text-cobalt transition-colors shrink-0">
          Beranda
        </Link>
        <span>/</span>
        <Link
          href={`/kategori/${encodeURIComponent(thread.kategori.slug)}`}
          className="hover:text-cobalt transition-colors shrink-0"
        >
          {thread.kategori.nama}
        </Link>
        <span>/</span>
        <span className="truncate text-ink/80">{thread.judul}</span>
      </nav>

      <article className="bg-white border-2 border-ink rounded-xl overflow-hidden shadow-hard">
        <div className={`h-3 ${warnaKategori(thread.kategori.nama).bar}`} />
        <div className="p-6 sm:p-9">
        <Link
          href={`/kategori/${encodeURIComponent(thread.kategori.slug)}`}
          className={`inline-block px-2.5 py-0.5 rounded-md text-xs font-bold border hover:-translate-y-0.5 transition-transform ${warnaKategori(thread.kategori.nama).chip}`}
        >
          # {thread.kategori.nama}
        </Link>

        <h1 className="mt-4 font-display text-3xl sm:text-5xl font-extrabold leading-[1.05] text-ink break-words">
          {thread.judul}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3 text-xs text-ink/65">
          <span className="flex items-center gap-2.5">
            <span
              className={`w-9 h-9 rounded-full ${warnaAvatar(thread.penulis)} flex items-center justify-center text-sm font-bold border-2 border-ink`}
            >
              {inisial(thread.penulis)}
            </span>
            <span className="text-sm font-semibold text-ink">{thread.penulis}</span>
          </span>
          <time dateTime={thread.createdAt.toISOString()} title={formatTanggalJam(thread.createdAt)}>
            🕒 {waktuRelatif(thread.createdAt)}
          </time>
          <span>👁 {thread.views} dilihat</span>
          <span>📖 {estimasiBaca(thread.konten)} menit baca</span>
        </div>

        <p className="mt-1 text-[11px] text-ink/55">{formatTanggalJam(thread.createdAt)}</p>

        <hr className="my-6 border-t-2 border-dashed border-ink/25" />

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
              className="max-h-[32rem] w-auto max-w-full rounded-lg border border-ink/20"
            />
          </a>
        )}

        <div className="mt-8 pt-6 border-t border-ink/20 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/"
            className="px-4 py-2.5 rounded-lg bg-white hover:bg-paper border border-ink/20 text-sm font-semibold text-ink transition-all"
          >
            &larr; Kembali
          </Link>
          <BagikanTombol judul={thread.judul} />
        </div>
        </div>
      </article>

      {/* Thread terkait */}
      <section aria-labelledby="judul-terkait" className="space-y-4">
        <h2 id="judul-terkait" className="text-lg font-bold text-ink">
          🔥 Diskusi lain di {thread.kategori.nama}
        </h2>
        {terkait.length > 0 ? (
          <div className="space-y-4">
            {terkait.map((t) => (
              <ThreadCard key={t.id} thread={t} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-white border border-ink/20 p-6 text-sm text-ink/65">
            Belum ada diskusi lain di kategori ini.{' '}
            <Link href="/buat-thread" className="text-cobalt hover:text-ink font-semibold">
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
    where: { kategoriId, NOT: { id: kecualiId } },
    include: { kategori: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  })
}

function ThreadSkeleton() {
  return (
    <div className="max-w-3xl mx-auto animate-pulse space-y-6" aria-busy="true">
      <div className="h-4 w-56 rounded bg-white"></div>
      <div className="rounded-xl bg-white border border-ink/20 p-9 space-y-5">
        <div className="h-6 w-28 rounded-xl bg-white"></div>
        <div className="h-9 w-4/5 rounded bg-white"></div>
        <div className="h-9 w-48 rounded bg-white"></div>
        <div className="space-y-3 pt-4">
          <div className="h-4 rounded bg-white"></div>
          <div className="h-4 rounded bg-white"></div>
          <div className="h-4 w-2/3 rounded bg-white"></div>
        </div>
      </div>
    </div>
  )
}