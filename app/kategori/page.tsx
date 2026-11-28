import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/PageShell';
import { warnaKategori } from '@/lib/format';

async function KategoriDirectoryContent() {
  let categories: { id: number; nama: string; slug: string }[] = [];
  let threads: {
    id: number;
    judul: string;
    createdAt: Date;
    kategoriId: number;
  }[] = [];
  let isConnected = true;

  try {
    categories = await prisma.kategori.findMany({
      orderBy: { id: 'asc' },
    });
    threads = await prisma.thread.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        judul: true,
        createdAt: true,
        kategoriId: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    isConnected = false;
  }

  // Hitung total thread & ambil thread terbaru per kategori
  const kategoriWithStats = categories.map((cat) => {
    const catThreads = threads.filter((t) => t.kategoriId === cat.id);
    return {
      ...cat,
      totalThreads: catThreads.length,
      latestThread: catThreads[0] || null,
    };
  });

  return (
    <>
      <Navbar isConnected={isConnected} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <div className="grid lg:grid-cols-[1fr_auto] gap-6 items-end mb-10">
          <div>
            <h1 className="font-display font-extrabold text-4xl sm:text-6xl leading-[0.98] tracking-tight">
              Pilih ruang yang mau kamu masuki
            </h1>
            <p className="mt-4 text-lg text-ink/70 max-w-xl">
              Setiap kategori punya obrolannya sendiri, dari info perkuliahan sampai tanya jawab tugas.
            </p>
          </div>
          <dl className="flex gap-8 lg:pb-2">
            <div>
              <dt className="text-sm text-ink/60">Kategori</dt>
              <dd className="font-display text-4xl font-extrabold">{categories.length}</dd>
            </div>
            <div>
              <dt className="text-sm text-ink/60">Total thread</dt>
              <dd className="font-display text-4xl font-extrabold">{threads.length}</dd>
            </div>
          </dl>
        </div>

        {kategoriWithStats.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {kategoriWithStats.map((cat, index) => {
              const warna = warnaKategori(cat.nama);
              return (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className={`group flex flex-col justify-between rounded-xl border-2 border-ink p-6 shadow-hard transition-all hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--color-ink)] ${warna.blok} ${
                    index === 0 ? 'lg:col-span-2' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display font-extrabold text-3xl leading-tight break-words">
                      {cat.nama}
                    </h2>
                    <div className="text-right shrink-0">
                      <p className="font-display text-5xl font-extrabold leading-none">
                        {cat.totalThreads}
                      </p>
                      <p className={`text-xs font-semibold mt-1 ${warna.sub}`}>thread</p>
                    </div>
                  </div>

                  <div className="mt-8">
                    <div className="rounded-lg bg-white text-ink border-2 border-ink px-4 py-3">
                      {cat.latestThread ? (
                        <>
                          <p className="text-xs font-bold text-ink/55 mb-0.5">Terbaru</p>
                          <p className="text-sm font-semibold line-clamp-1">
                            {cat.latestThread.judul}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-ink/60">Belum ada diskusi di sini.</p>
                      )}
                    </div>
                    <p className="mt-3 text-sm font-bold flex items-center gap-1.5">
                      Masuk kategori
                      <span className="group-hover:translate-x-1.5 transition-transform">&rarr;</span>
                    </p>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <div className="rounded-xl border-2 border-dashed border-ink/40 bg-white p-12 text-center">
            <h2 className="font-display font-bold text-xl mb-1.5">Belum ada kategori</h2>
            <p className="text-sm text-ink/65 max-w-sm mx-auto mb-6">
              Tambahkan baris pada tabel <code className="font-semibold text-cobalt">Kategori</code> di database agar muncul di halaman ini.
            </p>
            <Link href="/" className="btn-hard inline-block rounded-lg bg-cobalt text-white text-sm font-bold px-5 py-2.5">
              Kembali ke beranda
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}

export default function DaftarKategoriPage() {
  return (
    <div className="min-h-screen flex flex-col text-ink">
      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-ink/65">
            <div className="w-10 h-10 rounded-lg border-4 border-ink/15 border-t-cobalt animate-spin" />
            <p className="text-sm font-semibold">Memuat kategori...</p>
          </div>
        }
      >
        <KategoriDirectoryContent />
      </Suspense>
    </div>
  );
}