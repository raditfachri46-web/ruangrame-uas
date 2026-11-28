import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadForm } from '@/components/ThreadForm'
import { BATAS } from '@/lib/validation'

export const metadata = {
  title: 'Buat Diskusi Baru',
}

export default function BuatThreadPage({ searchParams }: PageProps<'/buat-thread'>) {
  return (
    <PageShell>
      <div className="mb-8">
        <Link href="/" className="text-xs text-slate-400 hover:text-white transition-colors">
          &larr; Kembali ke beranda
        </Link>
        <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-white">
          Buat Diskusi Baru
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Tanya tugas, bahas materi kuliah, atau bagikan info kampus ke teman-temanmu.
        </p>
      </div>

      <Suspense fallback={<FormSkeleton />}>
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

  let kategori: { id: number; nama: string; slug: string }[] = []
  try {
    kategori = await prisma.kategori.findMany({ orderBy: { nama: 'asc' } })
  } catch {
    return (
      <div
        role="alert"
        className="rounded-3xl bg-white/[0.03] border border-rose-500/30 p-8 text-center text-sm text-slate-300"
      >
        Gagal memuat kategori. Periksa koneksi database lalu muat ulang halaman.
      </div>
    )
  }

  if (kategori.length === 0) {
    return (
      <div className="rounded-3xl bg-white/[0.03] border border-dashed border-white/[0.15] p-8 text-center text-sm text-slate-300">
        Belum ada kategori di database, jadi thread belum bisa dibuat. Tambahkan minimal satu
        kategori dulu.
      </div>
    )
  }

  return <ThreadForm kategori={kategori} judulAwal={judulAwal} />
}

function FormSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-pulse" aria-busy="true">
      <div className="lg:col-span-2 rounded-3xl bg-white/[0.06] border border-white/[0.15] p-8 space-y-6">
        <div className="h-10 w-2/3 rounded-xl bg-white/20"></div>
        <div className="h-12 rounded-2xl bg-white/20"></div>
        <div className="h-48 rounded-2xl bg-white/20"></div>
        <div className="h-12 rounded-2xl bg-white/20"></div>
      </div>
      <div className="h-48 rounded-3xl bg-white/[0.06] border border-white/[0.15]"></div>
    </div>
  )
}