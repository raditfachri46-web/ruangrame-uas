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
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-ink">Cari Diskusi</h1>
        <p className="mt-2 text-sm text-ink/65">
          Cari berdasarkan judul, isi, atau nama penulis.
        </p>
      </div>

      {/* Form pencarian (GET biasa, tidak butuh JavaScript) */}
      <form
        action="/search"
        method="GET"
        role="search"
        className=" border border-ink/20 rounded-xl p-4 sm:p-5 shadow-hard-sm grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-3"
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
          className="rounded-lg bg-white border border-ink/20 px-4 py-3 text-sm text-ink placeholder:text-ink/45 outline-none focus:border-cobalt/40"
        />
        <label htmlFor="search-kategori" className="sr-only">
          Kategori
        </label>
        <select
          id="search-kategori"
          name="kategori"
          defaultValue={kategori}
          className="rounded-lg bg-white border border-ink/20 px-3 py-3 text-sm text-ink outline-none focus:border-cobalt/40"
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
          className="rounded-lg bg-white border border-ink/20 px-3 py-3 text-sm text-ink outline-none focus:border-cobalt/40"
        >
          {(Object.keys(URUTAN) as Urutan[]).map((u) => (
            <option key={u} value={u}>
              {URUTAN[u]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-6 py-3 rounded-lg btn-hard bg-cobalt text-white font-semibold text-sm  transition-all  "
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
        <div className="rounded-xl bg-white border border-coral/50 p-8 text-center text-sm text-ink/80">
          Gagal memuat hasil pencarian. Periksa koneksi database lalu coba lagi.
        </div>
      )}

      {/* Belum mencari */}
      {!gagal && !adaFilter && (
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-ink">🔥 Diskusi terpopuler</h2>
          {threads.length > 0 ? (
            threads.map((t) => <ThreadCard key={t.id} thread={t} />)
          ) : (
            <p className="text-sm text-ink/65">Belum ada diskusi.</p>
          )}
        </section>
      )}

      {/* Hasil pencarian */}
      {!gagal && adaFilter && (
        <section className="space-y-4" aria-live="polite">
          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <p className="text-ink/80">
              Ditemukan <strong className="text-ink">{total}</strong> diskusi
              {q && (
                <>
                  {' '}
                  untuk <strong className="text-ink">&ldquo;{q}&rdquo;</strong>
                </>
              )}
              {namaKategori && <> di kategori <strong className="text-ink">{namaKategori}</strong></>}
            </p>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-ink/55">Urutkan:</span>
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
            <div className="text-center py-14 rounded-xl bg-white border border-ink/20 p-8 shadow-hard-sm">
              <div className="w-14 h-14 rounded-lg bg-cobalt/10 border border-cobalt/40 flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h2 className="font-semibold text-ink mb-1">Tidak ada hasil</h2>
              <p className="text-xs text-ink/65 max-w-sm mx-auto leading-relaxed mb-5">
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
                    className="px-4 py-2 rounded-lg bg-cobalt text-xs font-semibold text-white"
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
      ? 'bg-cobalt/10 border-cobalt/40 text-ink'
      : 'bg-white border-ink/20 text-ink/80 hover:text-cobalt hover:border-cobalt/40'
  }`
}

function SearchSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-pulse" aria-busy="true">
      <div className="h-10 w-56 rounded bg-white"></div>
      <div className="h-20 rounded-xl bg-white border border-ink/20"></div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-36 rounded-xl bg-white border border-ink/20"></div>
      ))}
    </div>
  )
}