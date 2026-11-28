import { Suspense } from 'react'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadForm } from '@/components/ThreadForm'
import { Breadcrumb, EmptyState, Notice, PageHeading } from '@/components/ui'
import { BATAS } from '@/lib/validation'

export const metadata = {
  title: 'Buat thread',
}

export default function BuatThreadPage({ searchParams }: PageProps<'/buat-thread'>) {
  return (
    <PageShell aktif="buat">
      <Breadcrumb items={[{ label: 'Beranda', href: '/' }, { label: 'Buat thread' }]} />
      <PageHeading judul="Buat thread" deskripsi="Pilih kategori, lalu tulis judul dan isi." />
      <Suspense fallback={<p className="text-pudar">Memuat form</p>}>
        <FormLoader searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}

async function FormLoader({ searchParams }: Pick<PageProps<'/buat-thread'>, 'searchParams'>) {
  await connection() // data DB selalu diambil saat request, bukan saat build
  const sp = await searchParams
  const judulMentah = Array.isArray(sp.judul) ? sp.judul[0] : sp.judul
  const judulAwal = (judulMentah ?? '').slice(0, BATAS.judulMax)
  const slugMentah = Array.isArray(sp.kategori) ? sp.kategori[0] : sp.kategori

  let kategori: { id: number; nama: string; slug: string }[] = []
  try {
    kategori = await prisma.kategori.findMany({ orderBy: { nama: 'asc' } })
  } catch {
    return <Notice>Kategori tidak bisa dimuat. Periksa koneksi database, lalu muat ulang halaman.</Notice>
  }

  if (kategori.length === 0) {
    return (
      <EmptyState
        judul="Belum ada kategori"
        deskripsi="Thread butuh kategori. Tambahkan minimal satu baris di tabel Kategori pada Supabase."
      />
    )
  }

  const kategoriAwal = kategori.find((k) => k.slug === slugMentah)
  return (
    <ThreadForm
      kategori={kategori}
      judulAwal={judulAwal}
      kategoriAwal={kategoriAwal ? String(kategoriAwal.id) : ''}
    />
  )
}
