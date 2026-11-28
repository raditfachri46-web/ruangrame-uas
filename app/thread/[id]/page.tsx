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
import { Breadcrumb, EmptyState, Notice } from '@/components/ui'
import { estimasiBaca, formatTanggalJam, waktuRelatif } from '@/lib/format'

const ID_MAKS = 2147483647 // batas Int di PostgreSQL

export default function ThreadDetailPage({ params }: PageProps<'/thread/[id]'>) {
  return (
    <PageShell>
      <Suspense fallback={<p className="text-pudar">Memuat thread</p>}>
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
      <div className="max-w-3xl">
        <Notice>Thread tidak bisa dimuat. Periksa koneksi database, lalu muat ulang halaman.</Notice>
      </div>
    )
  }

  if (!thread) notFound()

  return (
    <div className="max-w-3xl">
      <ViewCounter threadId={thread.id} />

      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: thread.kategori.nama, href: `/kategori/${encodeURIComponent(thread.kategori.slug)}` },
          { label: thread.judul },
        ]}
      />

      <article>
        <header>
          <h1 className="judul-lebar text-3xl break-words sm:text-4xl">{thread.judul}</h1>
          <div className="mt-4 flex flex-wrap items-baseline gap-x-5 gap-y-1 text-sm">
            <span className="font-semibold">{thread.penulis}</span>
            <time dateTime={thread.createdAt.toISOString()} className="text-pudar">
              {waktuRelatif(thread.createdAt)}
            </time>
            <span className="text-pudar">{thread.views} dilihat</span>
            <span className="text-pudar">{estimasiBaca(thread.konten)} menit baca</span>
          </div>
          <p className="mt-1 text-xs text-pudar">{formatTanggalJam(thread.createdAt)}</p>
        </header>

        <div className="mt-8">
          <KontenTeks teks={thread.konten} />
        </div>

        {thread.gambarUrl && (
          <a
            href={thread.gambarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 block"
            aria-label="Buka gambar ukuran penuh"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={thread.gambarUrl}
              alt={`Gambar lampiran untuk thread: ${thread.judul}`}
              loading="lazy"
              className="max-h-[32rem] w-auto max-w-full rounded-sm border border-garis"
            />
          </a>
        )}

        <footer className="mt-10 flex flex-wrap items-center gap-3 border-t border-garis pt-5">
          <Link href="/" className="btn-tenang">
            Kembali ke beranda
          </Link>
          <BagikanTombol judul={thread.judul} />
        </footer>
      </article>

      <section aria-labelledby="judul-terkait" className="mt-14">
        <h2 id="judul-terkait" className="mb-4 text-lg font-bold">
          Thread lain di {thread.kategori.nama}
        </h2>
        {terkait.length > 0 ? (
          <ul className="lembar">
            {terkait.map((t) => (
              <ThreadCard key={t.id} thread={t} tingkat={3} />
            ))}
          </ul>
        ) : (
          <EmptyState
            judul="Belum ada thread lain di kategori ini"
            aksi={
              <Link href={`/buat-thread?kategori=${encodeURIComponent(thread.kategori.slug)}`} className="btn-tenang">
                Buat thread di {thread.kategori.nama}
              </Link>
            }
          />
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
