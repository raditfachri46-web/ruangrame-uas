import { Suspense, type CSSProperties } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ThreadCard } from '@/components/ThreadCard';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/PageShell';
import { ambilCuplikan, warnaKategori } from '@/lib/format';

const LATAR_TEMPELAN = ['bg-sun', 'bg-white', 'bg-mint/30'];
const MIRING = ['-2.2deg', '1.6deg', '-1deg'];
const GESER = ['', 'lg:ml-10', 'lg:ml-4'];

async function ForumContent() {
  await connection();

  let categories: { id: number; nama: string; slug: string; _count: { threads: number } }[] = [];
  let threads: {
    id: number;
    judul: string;
    konten: string;
    penulis: string;
    views: number;
    createdAt: Date;
    gambarUrl: string | null;
    kategori: { nama: string } | null;
  }[] = [];
  let totalThread = 0;
  let isConnected = true;

  try {
    categories = await prisma.kategori.findMany({
      include: { _count: { select: { threads: true } } },
    });
    threads = await prisma.thread.findMany({
      where: { deletedAt: null },
      include: { kategori: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    totalThread = await prisma.thread.count();
  } catch {
    isConnected = false;
  }

  const papan = threads.slice(0, 3);
  const [sorotan, ...lainnya] = threads;

  return (
    <>
      <Navbar isConnected={isConnected} />

      {/* Hero: pernyataan di kiri, papan tempelan dari diskusi nyata di kanan */}
      <section className="border-b-2 border-ink">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid lg:grid-cols-[1.1fr_1fr] gap-10 lg:gap-14 items-center">
          <div>
            <h1 className="font-display font-extrabold text-ink text-5xl sm:text-6xl lg:text-7xl leading-[0.95] tracking-tight">
              Tanya tugas, bahas matkul, bagi info.
            </h1>
            <p className="mt-5 text-lg text-ink/75 leading-relaxed max-w-md">
              Forum diskusi untuk anak kampus. Satu tempat untuk pertanyaan yang biasanya cuma beredar di grup chat.
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link
                href="/buat-thread"
                className="btn-hard rounded-lg bg-cobalt text-white font-bold px-6 py-3"
              >
                Mulai diskusi
              </Link>
              <Link
                href="/search"
                className="btn-hard rounded-lg bg-white text-ink font-bold px-6 py-3"
              >
                Cari diskusi
              </Link>
            </div>

            {isConnected && (
              <dl className="mt-9 flex flex-wrap gap-x-8 gap-y-3 text-ink">
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Jumlah diskusi</dt>
                  <dd className="font-display text-3xl font-extrabold">{totalThread}</dd>
                  <span className="text-sm text-ink/65">diskusi</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <dt className="sr-only">Jumlah kategori</dt>
                  <dd className="font-display text-3xl font-extrabold">{categories.length}</dd>
                  <span className="text-sm text-ink/65">kategori</span>
                </div>
              </dl>
            )}
          </div>

          <div className="relative" aria-label="Diskusi yang baru ditempel">
            {papan.length > 0 ? (
              <ul className="flex flex-col gap-5 py-2">
                {papan.map((t, i) => {
                  const warna = warnaKategori(t.kategori?.nama);
                  return (
                    <li
                      key={t.id}
                      className={`tempelan ${GESER[i]}`}
                      style={
                        {
                          '--miring': MIRING[i],
                          '--urut': i,
                        } as CSSProperties
                      }
                    >
                      <Link
                        href={`/thread/${t.id}`}
                        className={`relative block rounded-lg border-2 border-ink p-4 pt-5 shadow-hard-sm ${LATAR_TEMPELAN[i]}`}
                      >
                        <span
                          aria-hidden
                          className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-coral border-2 border-ink"
                        />
                        <span className="flex items-center gap-2 text-xs font-bold text-ink/70 mb-1.5">
                          <span className={`w-2.5 h-2.5 rounded-full border border-ink ${warna.titik}`} />
                          {t.kategori?.nama ?? 'Umum'}
                        </span>
                        <span className="block font-display font-bold text-lg leading-snug text-ink line-clamp-2">
                          {t.judul}
                        </span>
                        <span className="block mt-1 text-sm text-ink/65 line-clamp-1">
                          {ambilCuplikan(t.konten, '', 80)}
                        </span>
                        <span className="block mt-2.5 text-xs font-semibold text-ink/70">
                          oleh {t.penulis}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="tempelan rounded-lg border-2 border-ink bg-sun p-6 shadow-hard" style={{ '--miring': '-1.5deg' } as CSSProperties}>
                <p className="font-display font-bold text-2xl leading-snug">
                  Papan ini masih kosong.
                </p>
                <p className="mt-2 text-sm text-ink/75">
                  Tempel diskusi pertama dan jadi yang memulai.
                </p>
                <Link href="/buat-thread" className="btn-hard inline-block mt-4 rounded-lg bg-white font-bold px-4 py-2 text-sm">
                  Buat thread
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Kategori sebagai strip jelajah */}
      {categories.length > 0 && (
        <section aria-label="Kategori" className="border-b-2 border-ink bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center gap-3 overflow-x-auto">
            <span className="shrink-0 font-display font-bold text-sm">Jelajah</span>
            {categories.map((cat) => {
              const warna = warnaKategori(cat.nama);
              return (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="shrink-0 inline-flex items-center gap-2 rounded-full border-2 border-ink px-3.5 py-1.5 text-sm font-semibold hover:-translate-y-0.5 hover:bg-paper transition-all"
                >
                  <span className={`w-2.5 h-2.5 rounded-full border border-ink ${warna.titik}`} />
                  {cat.nama}
                  <span className="text-ink/50 text-xs font-bold">{cat._count.threads}</span>
                </Link>
              );
            })}
            <Link href="/kategori" className="shrink-0 text-sm font-bold text-cobalt hover:underline underline-offset-4 ml-1">
              Semua kategori &rarr;
            </Link>
          </div>
        </section>
      )}

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1fr_17rem] gap-10">
        <section aria-labelledby="judul-terbaru">
          <div className="flex items-end justify-between gap-4 mb-5">
            <h2 id="judul-terbaru" className="font-display text-3xl font-extrabold">
              Diskusi terbaru
            </h2>
            <Link href="/trending-topic" className="text-sm font-bold text-cobalt hover:underline underline-offset-4">
              Lihat yang trending &rarr;
            </Link>
          </div>

          {sorotan ? (
            <div className="space-y-5">
              <ThreadCard thread={sorotan} variant="tile" />
              {lainnya.length > 0 && (
                <div className="grid gap-4">
                  {lainnya.map((thread) => (
                    <ThreadCard key={thread.id} thread={thread} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border-2 border-dashed border-ink/40 bg-white p-10 text-center">
              <h3 className="font-display text-xl font-bold mb-1">
                {isConnected ? 'Belum ada diskusi' : 'Diskusi belum bisa dimuat'}
              </h3>
              <p className="text-sm text-ink/65 max-w-xs mx-auto mb-5">
                {isConnected
                  ? 'Buat thread pertama dan buka obrolan di RuangRame.'
                  : 'Koneksi ke database bermasalah. Muat ulang halaman sebentar lagi.'}
              </p>
              {isConnected && (
                <Link href="/buat-thread" className="btn-hard inline-block rounded-lg bg-cobalt text-white font-bold px-5 py-2.5 text-sm">
                  Buat thread
                </Link>
              )}
            </div>
          )}
        </section>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl border-2 border-ink bg-white p-5 shadow-hard-sm">
            <h3 className="font-display font-bold text-lg mb-3">Kategori</h3>
            {categories.length > 0 ? (
              <ul className="-mx-2">
                {categories.map((cat) => {
                  const warna = warnaKategori(cat.nama);
                  return (
                    <li key={cat.id}>
                      <Link
                        href={`/kategori/${cat.slug}`}
                        className="flex items-center gap-3 px-2 py-2 rounded-lg text-sm font-semibold hover:bg-paper transition-colors group"
                      >
                        <span className={`w-3 h-3 rounded-full border border-ink ${warna.titik}`} />
                        <span className="flex-1 truncate">{cat.nama}</span>
                        <span className="text-xs text-ink/50 group-hover:text-ink">{cat._count.threads}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="text-sm text-ink/60">Belum ada kategori.</p>
            )}
          </div>

          <div className="rounded-xl border-2 border-ink bg-sun p-5 -rotate-1">
            <h3 className="font-display font-bold text-lg mb-1">Aturan main</h3>
            <p className="text-sm text-ink/80 leading-relaxed">
              Jaga kesopanan antar sesama anggota dan pilih kategori yang tepat supaya diskusimu mudah ditemukan.
            </p>
          </div>
        </aside>
      </main>

      <Footer />
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col text-ink">
      <Suspense
        fallback={
          <div className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 text-ink/65">
            <div className="w-10 h-10 rounded-lg border-4 border-ink/15 border-t-cobalt animate-spin" />
            <p className="text-sm font-semibold">Memuat RuangRame...</p>
          </div>
        }
      >
        <ForumContent />
      </Suspense>
    </div>
  );
}