import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadCard, type ThreadCardData } from '@/components/ThreadCard'
import { Breadcrumb, EmptyState, Notice, PageHeading } from '@/components/ui'

async function ThreadPerKategori({ params }: { params: Promise<{ slug: string }> }) {
  await connection() // data DB selalu diambil saat request, bukan saat build
  const { slug } = await params

  let kategori: { id: number; nama: string; slug: string } | null = null
  let semuaKategori: { id: number; nama: string; slug: string }[] = []
  let threads: ThreadCardData[] = []
  let gagal = false

  try {
    semuaKategori = await prisma.kategori.findMany({ orderBy: { id: 'asc' } })
    kategori = await prisma.kategori.findFirst({ where: { slug } })
    if (kategori) {
      threads = await prisma.thread.findMany({
        where: { kategoriId: kategori.id },
        include: { kategori: true },
        orderBy: { createdAt: 'desc' },
      })
    }
  } catch {
    gagal = true
  }

  if (gagal) {
    return <Notice>Thread tidak bisa dimuat. Periksa koneksi database, lalu muat ulang halaman.</Notice>
  }

  if (!kategori) {
    return (
      <>
        <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Kategori', href: '/kategori' }, { label: slug }]} />
        <EmptyState
          judul="Kategori tidak ditemukan"
          deskripsi={`Tidak ada kategori dengan alamat "${slug}". Linknya salah atau kategori sudah dihapus.`}
          aksi={
            <Link href="/kategori" className="btn-utama">
              Lihat semua kategori
            </Link>
          }
        />
      </>
    )
  }

  return (
    <>
      <Breadcrumb
        items={[{ label: 'Beranda', href: '/' }, { label: 'Kategori', href: '/kategori' }, { label: kategori.nama }]}
      />
      <PageHeading
        judul={kategori.nama}
        deskripsi={`${threads.length} thread`}
        aksi={
          <Link href={`/buat-thread?kategori=${encodeURIComponent(kategori.slug)}`} className="btn-utama">
            Buat thread di sini
          </Link>
        }
      />

      <nav aria-label="Kategori" className="-mx-2.5 mb-6 flex gap-1 overflow-x-auto pb-1">
        {semuaKategori.map((k) => (
          <Link
            key={k.id}
            href={`/kategori/${k.slug}`}
            aria-current={k.slug === kategori.slug ? 'page' : undefined}
            className="filter-tab whitespace-nowrap"
          >
            {k.nama}
          </Link>
        ))}
      </nav>

      {threads.length > 0 ? (
        <ul className="lembar">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </ul>
      ) : (
        <EmptyState
          judul={`Belum ada thread di ${kategori.nama}`}
          deskripsi="Buat thread pertama untuk membuka obrolan di kategori ini."
          aksi={
            <Link href={`/buat-thread?kategori=${encodeURIComponent(kategori.slug)}`} className="btn-utama">
              Buat thread
            </Link>
          }
        />
      )}
    </>
  )
}

export default function KategoriDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <PageShell aktif="kategori">
      <div className="max-w-3xl">
        <Suspense fallback={<p className="text-pudar">Memuat thread</p>}>
          <ThreadPerKategori params={params} />
        </Suspense>
      </div>
    </PageShell>
  )
}
