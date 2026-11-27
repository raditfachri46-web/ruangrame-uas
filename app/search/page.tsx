import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadCard } from '@/components/ThreadCard'
import { Pagination } from '@/components/Pagination'
import {
  PER_HALAMAN,
  URUTAN,
  buatOrderBy,
  buatUrlSearch,
  buatWhere,
  parseSearchParams,
  type Urutan,
} from '@/lib/search'

export const metadata = {
  title: 'Cari Diskusi',
}

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <PageShell>
      <Suspense fallback={<SearchSkeleton />}>
        <HasilPencarian searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}

async function HasilPencarian({ searchParams }: Pick<PageProps<'/search'>, 'searchParams'>) {
  await connection() // data DB selalu diambil saat request, bukan saat build
  const { q, kategori, urut, halaman } = parseSearchParams(await searchParams)
  const adaFilter = q !== '' || kategori !== ''

  let daftarKategori: { id: number; nama: string; slug: string }[] = []
  let threads: Awaited<ReturnType<typeof ambilThread>> = []
  let total = 0
  let gagal = false

  try {
    daftarKategori = await prisma.kategori.findMany({ orderBy: { nama: 'asc' } })
    if (adaFilter) {
      const where = buatWhere(q, kategori)
      ;[total, threads] = await Promise.all([
        prisma.thread.count({ where }),
        ambilThread(where, urut, (halaman - 1) * PER_HALAMAN, PER_HALAMAN),
      ])
    } else {
      // Belum mencari apa-apa: tampilkan thread terpopuler sebagai saran
      threads = await ambilThread({ deletedAt: null }, 'populer', 0, 5)
    }
  } catch {
    gagal = true
  }

  const totalHalaman = Math.max(1, Math.ceil(total / PER_HALAMAN))
  // redirect harus di luar try/catch
  if (!gagal && adaFilter && total > 0 && halaman > totalHalaman) {
    redirect(buatUrlSearch({ q, kategori, urut, halaman: totalHalaman }))
  }

  const namaKategori = daftarKategori.find((k) => k.slug === kategori)?.nama

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">Cari Diskusi</h1>
        <p className="mt-2 text-sm text-slate-400">
          Cari berdasarkan judul, isi, atau nama penulis.
        </p>
      </div>

      {/* Form pencarian (GET biasa, tidak butuh JavaScript) */}
      <form
        action="/search"
        method="GET"
        role="search"
        className="backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] border-t-white/20 rounded-3xl p-4 sm:p-5 shadow-2xl grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3"
      >
        <label htmlFor="search-q" className="sr-only">
          Kata kunci
        </label>
        <input
          id="search-q"
          name="q"
          type="search"
          defaultValue={q}
          maxLength={100}
          placeholder="Ketik kata kunci..."
          className="rounded-2xl bg-white/[0.05] border border-white/[0.1] px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-fuchsia-400/60"
        />
        <label htmlFor="search-kategori" className="sr-only">
          Kategori
        </label>
        <select
          id="search-kategori"
          name="kategori"
          defaultValue={kategori}
          className="rounded-2xl bg-[#14111f] border border-white/[0.1] px-3 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-400/60"
        >
          <option value="">Semua kategori</option>
          {daftarKategori.map((k) => (
            <option key={k.id} value={k.slug}>
              {k.nama}
            </option>
          ))}
        </select>
        <label htmlFor="search-urut" className="sr-only">
          Urutkan
        </label>
        <select
          id="search-urut"
          name="urut"
          defaultValue={urut}
          className="rounded-2xl bg-[#14111f] border border-white/[0.1] px-3 py-3 text-sm text-slate-200 outline-none focus:border-fuchsia-400/60"
        >
          {(Object.keys(URUTAN) as Urutan[]).map((u) => (
            <option key={u} value={u}>
              {URUTAN[u]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/25 transition-all active:scale-95 border border-white/25"
        >
          Cari
        </button>
      </form>

      {/* Filter cepat kategori */}
      {daftarKategori.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={buatUrlSearch({ q, urut })}
            className={chip(kategori === '')}
          >
            Semua
          </Link>
          {daftarKategori.map((k) => (
            <Link
              key={k.id}
              href={buatUrlSearch({ q, kategori: k.slug, urut })}
              className={chip(kategori === k.slug)}
            >
              # {k.nama}
            </Link>
          ))}
        </div>
      )}

      {gagal && (
        <div className="rounded-3xl bg-white/[0.03] border border-rose-500/30 p-8 text-center text-sm text-slate-300">
          Gagal memuat hasil pencarian. Periksa koneksi database lalu coba lagi.
        </div>
      )}

      {/* Belum mencari */}
      {!gagal && !adaFilter && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-white">🔥 Diskusi terpopuler</h2>
          {threads.length > 0 ? (
            threads.map((t) => <ThreadCard key={t.id} thread={t} />)
          ) : (
            <p className="text-sm text-slate-400">Belum ada diskusi.</p>
          )}
        </section>
      )}

      {/* Hasil pencarian */}
      {!gagal && adaFilter && (
        <section className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-slate-300">
              Ditemukan <strong className="text-white">{total}</strong> diskusi
              {q && (
                <>
                  {' '}
                  untuk <strong className="text-amber-200">&ldquo;{q}&rdquo;</strong>
                </>
              )}
              {namaKategori && <> di kategori <strong className="text-white">{namaKategori}</strong></>}
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-500">Urutkan:</span>
              {(Object.keys(URUTAN) as Urutan[]).map((u) => (
                <Link key={u} href={buatUrlSearch({ q, kategori, urut: u })} className={chip(urut === u)}>
                  {URUTAN[u]}
                </Link>
              ))}
            </div>
          </div>

          {total > 0 ? (
            <>
              <div className="space-y-4">
                {threads.map((t) => (
                  <ThreadCard key={t.id} thread={t} kataKunci={q} />
                ))}
              </div>
              <Pagination
                halaman={halaman}
                totalHalaman={totalHalaman}
                buatHref={(h) => buatUrlSearch({ q, kategori, urut, halaman: h })}
              />
            </>
          ) : (
            <div className="text-center py-14 rounded-3xl bg-white/[0.03] border border-white/[0.09] p-8 shadow-2xl">
              <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h2 className="font-semibold text-white mb-1">Tidak ada hasil</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-5">
                Coba kata kunci lain yang lebih umum, periksa ejaan, atau kurangi filter kategori.
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {kategori && q && (
                  <Link href={buatUrlSearch({ q, urut })} className={chip(false)}>
                    Hapus filter kategori
                  </Link>
                )}
                {q && (
                  <Link
                    href={`/buat-thread?judul=${encodeURIComponent(q)}`}
                    className="px-4 py-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-xs font-semibold text-white"
                  >
                    + Buat diskusi &ldquo;{q.length > 30 ? q.slice(0, 30) + '…' : q}&rdquo;
                  </Link>
                )}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  )
}

function ambilThread(
  where: Prisma.ThreadWhereInput,
  urut: Urutan,
  skip: number,
  take: number
) {
  return prisma.thread.findMany({
    where,
    include: { kategori: true },
    orderBy: buatOrderBy(urut),
    skip,
    take,
  })
}

function chip(aktif: boolean): string {
  return `px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
    aktif
      ? 'bg-fuchsia-500/20 border-fuchsia-400/60 text-white'
      : 'bg-white/[0.04] border-white/[0.09] text-slate-300 hover:text-white hover:border-fuchsia-400/35'
  }`
}

function SearchSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-56 rounded bg-white/10"></div>
      <div className="h-20 rounded-3xl bg-white/[0.04] border border-white/[0.09]"></div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 rounded-3xl bg-white/[0.04] border border-white/[0.09]"></div>
      ))}
    </div>
  )
}
