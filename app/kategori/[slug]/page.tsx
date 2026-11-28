import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/PageShell'
import { ThreadCard } from '@/components/ThreadCard'
import { warnaKategori } from '@/lib/format'

type ThreadItem = {
  id: number
  judul: string
  konten: string
  penulis: string
  views: number
  createdAt: Date
  gambarUrl: string | null
  kategori: { nama: string } | null
}

async function ThreadPerKategori({ params }: { params: Promise<{ slug: string }> }) {
  await connection()
  const { slug } = await params

  let kategori: { id: number; nama: string; slug: string } | null = null
  let semuaKategori: { id: number; nama: string; slug: string }[] = []
  let threads: ThreadItem[] = []
  let gagal = false

  try {
    semuaKategori = await prisma.kategori.findMany({ orderBy: { id: 'asc' } })
    kategori = await prisma.kategori.findFirst({ where: { slug } })
    if (kategori) {
      threads = await prisma.thread.findMany({
        where: { kategoriId: kategori.id, deletedAt: null },
        include: { kategori: true },
        orderBy: { createdAt: 'desc' },
      })
    }
  } catch {
    gagal = true
  }

  const buatLink = kategori
    ? `/buat-thread?kategori=${encodeURIComponent(kategori.slug)}`
    : '/buat-thread'

  let isi
  if (gagal) {
    isi = (
      <div className="rounded-xl border-2 border-ink bg-coral/20 p-6 text-sm font-semibold">
        Thread tidak bisa dimuat. Periksa koneksi database, lalu muat ulang halaman.
      </div>
    )
  } else if (!kategori) {
    isi = (
      <div className="rounded-xl border-2 border-dashed border-ink/40 bg-white p-12 text-center">
        <h1 className="font-display font-bold text-xl mb-1.5">Kategori tidak ditemukan</h1>
        <p className="text-sm text-ink/65 max-w-sm mx-auto mb-6">
          Tidak ada kategori dengan alamat &quot;{slug}&quot;. Linknya salah atau kategori sudah dihapus.
        </p>
        <Link
          href="/kategori"
          className="btn-hard inline-block rounded-lg bg-cobalt text-white text-sm font-bold px-5 py-2.5"
        >
          Lihat semua kategori
        </Link>
      </div>
    )
  } else {
    const warna = warnaKategori(kategori.nama)
    const slugAktif = kategori.slug
    isi = (
      <>
        <header
          className={`rounded-xl border-2 border-ink p-6 sm:p-8 shadow-hard flex flex-wrap items-end justify-between gap-5 ${warna.blok}`}
        >
          <div>
            <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight break-words">
              {kategori.nama}
            </h1>
            <p className={`mt-2 text-sm font-semibold ${warna.sub}`}>{threads.length} thread</p>
          </div>
          <Link
            href={buatLink}
            className="btn-hard rounded-lg bg-white text-ink font-bold text-sm px-5 py-2.5"
          >
            Buat thread di sini
          </Link>
        </header>

        <nav aria-label="Kategori lain" className="mt-6 flex gap-2 overflow-x-auto pb-1">
          {semuaKategori.map((k) => {
            const aktif = k.slug === slugAktif
            return (
              <Link
                key={k.id}
                href={`/kategori/${k.slug}`}
                aria-current={aktif ? 'page' : undefined}
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-semibold transition-all hover:-translate-y-0.5 ${
                  aktif ? 'bg-ink text-white' : 'bg-white hover:bg-paper'
                }`}
              >
                <span className={`w-2.5 h-2.5 rounded-full border border-ink ${warnaKategori(k.nama).titik}`} />
                {k.nama}
              </Link>
            )
          })}
        </nav>

        {threads.length > 0 ? (
          <div className="mt-6 grid gap-4">
            {threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-xl border-2 border-dashed border-ink/40 bg-white p-10 text-center">
            <h2 className="font-display text-xl font-bold mb-1">Belum ada thread di {kategori.nama}</h2>
            <p className="text-sm text-ink/65 max-w-xs mx-auto mb-5">
              Buat thread pertama untuk membuka obrolan di kategori ini.
            </p>
            <Link
              href={buatLink}
              className="btn-hard inline-block rounded-lg bg-cobalt text-white font-bold px-5 py-2.5 text-sm"
            >
              Buat thread
            </Link>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <Navbar isConnected={!gagal} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <nav
          aria-label="Breadcrumb"
          className="mb-5 flex flex-wrap items-center gap-2 text-sm font-semibold text-ink/65"
        >
          <Link href="/" className="hover:text-ink hover:underline underline-offset-4">
            Beranda
          </Link>
          <span aria-hidden>/</span>
          <Link href="/kategori" className="hover:text-ink hover:underline underline-offset-4">
            Kategori
          </Link>
          <span aria-hidden>/</span>
          <span className="text-ink">{kategori ? kategori.nama : slug}</span>
        </nav>

        {isi}
      </main>

      <Footer />
    </>
  )
}

export default function KategoriDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <div className="min-h-screen flex flex-col text-ink">
      <Suspense
        fallback={
          <div className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 text-ink/65">
            <div className="w-10 h-10 rounded-lg border-4 border-ink/15 border-t-cobalt animate-spin" />
            <p className="text-sm font-semibold">Memuat thread...</p>
          </div>
        }
      >
        <ThreadPerKategori params={params} />
      </Suspense>
    </div>
  )
}