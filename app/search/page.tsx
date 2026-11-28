import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import type { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadCard } from '@/components/ThreadCard'
import { EmptyState, Notice, PageHeading } from '@/components/ui'
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
  title: 'Cari thread',
}

export default function SearchPage({ searchParams }: PageProps<'/search'>) {
  return (
    <PageShell aktif="cari">
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
      threads = await ambilThread({}, 'populer', 0, 5)
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
    <div className="max-w-3xl">
      <PageHeading judul="Cari thread" deskripsi="Cari di judul, isi, atau nama penulis." />

      {/* Form pencarian (GET biasa, tidak butuh JavaScript) */}
      <form
        action="/search"
        role="search"
        className="grid gap-4 border border-garis bg-putih p-4 sm:grid-cols-[minmax(0,1fr)_11rem_9rem_auto] sm:items-end"
      >
        <div>
          <label htmlFor="search-q" className="label-isian">
            Kata kunci
          </label>
          <input
            id="search-q"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={100}
            placeholder="Contoh: basis data"
            className="isian"
          />
        </div>
        <div>
          <label htmlFor="search-kategori" className="label-isian">
            Kategori
          </label>
          <select id="search-kategori" name="kategori" defaultValue={kategori} className="isian">
            <option value="">Semua</option>
            {daftarKategori.map((k) => (
              <option key={k.id} value={k.slug}>
                {k.nama}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="search-urut" className="label-isian">
            Urutan
          </label>
          <select id="search-urut" name="urut" defaultValue={urut} className="isian">
            {(Object.keys(URUTAN) as Urutan[]).map((u) => (
              <option key={u} value={u}>
                {URUTAN[u]}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn-utama">
          Cari
        </button>
      </form>

      {/* Filter cepat kategori */}
      {daftarKategori.length > 0 && (
        <nav aria-label="Filter kategori" className="-mx-2.5 mt-4 flex gap-1 overflow-x-auto pb-1">
          <Link
            href={buatUrlSearch({ q, urut })}
            aria-current={kategori === '' ? 'page' : undefined}
            className="filter-tab whitespace-nowrap"
          >
            Semua
          </Link>
          {daftarKategori.map((k) => (
            <Link
              key={k.id}
              href={buatUrlSearch({ q, kategori: k.slug, urut })}
              aria-current={kategori === k.slug ? 'page' : undefined}
              className="filter-tab whitespace-nowrap"
            >
              {k.nama}
            </Link>
          ))}
        </nav>
      )}

      <div className="mt-8">
        {gagal && (
          <Notice>Hasil pencarian tidak bisa dimuat. Periksa koneksi database, lalu coba lagi.</Notice>
        )}

        {/* Belum mencari */}
        {!gagal && !adaFilter && (
          <section aria-labelledby="judul-populer">
            <h2 id="judul-populer" className="mb-4 text-lg font-bold">
              Thread terpopuler
            </h2>
            {threads.length > 0 ? (
              <ul className="lembar">
                {threads.map((t) => (
                  <ThreadCard key={t.id} thread={t} />
                ))}
              </ul>
            ) : (
              <p className="text-pudar">Belum ada thread.</p>
            )}
          </section>
        )}

        {/* Hasil pencarian */}
        {!gagal && adaFilter && (
          <section aria-live="polite">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-x-6 gap-y-2">
              <p>
                <strong>{total}</strong> thread
                {q && (
                  <>
                    {' '}
                    untuk <strong>&ldquo;{q}&rdquo;</strong>
                  </>
                )}
                {namaKategori && <> di {namaKategori}</>}
              </p>
              <div className="-mx-2.5 flex items-center gap-1 sm:mx-0">
                {(Object.keys(URUTAN) as Urutan[]).map((u) => (
                  <Link
                    key={u}
                    href={buatUrlSearch({ q, kategori, urut: u })}
                    aria-current={urut === u ? 'page' : undefined}
                    className="filter-tab"
                  >
                    {URUTAN[u]}
                  </Link>
                ))}
              </div>
            </div>

            {total > 0 ? (
              <>
                <ul className="lembar">
                  {threads.map((t) => (
                    <ThreadCard key={t.id} thread={t} kataKunci={q} />
                  ))}
                </ul>
                <Pagination
                  halaman={halaman}
                  totalHalaman={totalHalaman}
                  buatHref={(h) => buatUrlSearch({ q, kategori, urut, halaman: h })}
                />
              </>
            ) : (
              <EmptyState
                judul="Tidak ada thread yang cocok"
                deskripsi="Coba kata kunci yang lebih umum, atau hapus filter kategori."
                aksi={
                  <>
                    {kategori && q && (
                      <Link href={buatUrlSearch({ q, urut })} className="btn-tenang">
                        Hapus filter kategori
                      </Link>
                    )}
                    {q && (
                      <Link href={`/buat-thread?judul=${encodeURIComponent(q)}`} className="btn-utama">
                        Buat thread dengan judul ini
                      </Link>
                    )}
                  </>
                }
              />
            )}
          </section>
        )}
      </div>
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

function SearchSkeleton() {
  return <p className="text-pudar">Memuat hasil</p>
}
