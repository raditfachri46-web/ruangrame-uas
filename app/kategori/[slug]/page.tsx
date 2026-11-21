import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

async function KategoriThreadList({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let kategori: { id: number; nama: string; slug: string } | null = null;
  let allCategories: { id: number; nama: string; slug: string }[] = [];
  let threads: {
    id: number;
    judul: string;
    konten: string;
    penulis: string;
    views: number;
    createdAt: Date;
    kategoriId: number;
  }[] = [];
  let isConnected = true;

  try {
    allCategories = await prisma.kategori.findMany({
      orderBy: { id: 'asc' },
    });
    kategori = await prisma.kategori.findFirst({
      where: { slug },
    });

    if (kategori) {
      threads = await prisma.thread.findMany({
        where: { kategoriId: kategori.id },
        orderBy: { createdAt: 'desc' },
      });
    }
  } catch {
    isConnected = false;
  }

  return (
    <>
      {/* Glass Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09080f]/75 border-b border-white/[0.09] shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-500/25 border border-white/25 group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent">
              RuangRame
            </span>
          </Link>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <nav className="hidden md:flex items-center gap-2 text-xs font-semibold">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Beranda
              </Link>
              <Link
                href="/kategori"
                className="px-3.5 py-2 rounded-full bg-violet-500/20 text-violet-200 border border-violet-400/30"
              >
                Kategori
              </Link>
            </nav>

            <div
              className={`flex items-center space-x-2.5 px-4 py-2 rounded-full text-xs font-semibold backdrop-blur-md border shadow-inner ${
                isConnected
                  ? 'bg-emerald-500/10 border-emerald-400/30 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  isConnected
                    ? 'bg-emerald-400 animate-pulse shadow-[0_0_12px_#34d399]'
                    : 'bg-rose-400'
                }`}
              ></span>
              <span>{isConnected ? 'Database Connected' : 'Connection Error'}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-10 space-y-8 relative z-10">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-violet-300 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <Link href="/kategori" className="hover:text-violet-300 transition-colors">
            Kategori
          </Link>
          <span>/</span>
          <span className="text-fuchsia-300 font-semibold">
            {kategori ? `#${kategori.nama}` : slug}
          </span>
        </nav>

        {!kategori ? (
          /* Tampilan jika slug kategori tidak ditemukan di Supabase */
          <div className="text-center py-24 backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] border-t-white/20 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-400/25 flex items-center justify-center mx-auto mb-4 text-3xl">
              🔍
            </div>
            <h1 className="text-xl font-bold text-white mb-2">
              Kategori &ldquo;{slug}&rdquo; tidak ditemukan
            </h1>
            <p className="text-xs text-slate-400 max-w-md mx-auto mb-6 leading-relaxed">
              Sub-forum yang kamu buka belum terdaftar di database atau tautan kategori sudah berubah.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link
                href="/"
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white text-xs font-semibold shadow-lg shadow-fuchsia-600/25 border border-white/20"
              >
                &larr; Kembali ke Beranda
              </Link>
              <Link
                href="/kategori"
                className="px-5 py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 text-xs font-semibold border border-white/10 transition-all"
              >
                Lihat Semua Kategori
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Category Header Banner */}
            <section className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-violet-950/50 via-fuchsia-950/25 to-zinc-900/50 border border-white/[0.1] border-t-white/25 rounded-3xl p-8 sm:p-10 shadow-2xl">
              <div className="absolute -top-12 -right-12 w-72 h-72 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none"></div>
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
                <div className="max-w-xl">
                  <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/25 text-violet-200 text-xs font-semibold mb-3 backdrop-blur-md">
                    📂 Sub-Forum Kategori
                  </span>
                  <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
                    # {kategori.nama}
                  </h1>
                  <p className="text-sm text-slate-300/80 leading-relaxed">
                    Menampilkan seluruh diskusi mahasiswa yang masuk dalam sub-forum{' '}
                    <span className="text-fuchsia-300 font-semibold">{kategori.nama}</span>.
                  </p>
                </div>

                <div className="flex flex-col sm:items-end gap-3 shrink-0">
                  <span className="text-xs font-semibold px-4 py-1.5 rounded-full bg-white/[0.06] text-violet-200 border border-white/10">
                    Total: {threads.length} Thread
                  </span>
                  <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/30 transition-all transform active:scale-95 border border-white/25">
                    + Buat Thread di Kategori Ini
                  </button>
                </div>
              </div>
            </section>

            {/* Filter Cepat Pindah Kategori */}
            {allCategories.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <span className="text-xs font-semibold text-slate-400 mr-1 shrink-0">
                  Sub-forum lain:
                </span>
                {allCategories.map((cat) => {
                  const isActive = cat.slug === kategori?.slug;
                  return (
                    <Link
                      key={cat.id}
                      href={`/kategori/${cat.slug}`}
                      className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all border ${
                        isActive
                          ? 'bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 text-white border-fuchsia-400/50 shadow-md shadow-fuchsia-500/15'
                          : 'bg-white/[0.03] hover:bg-white/[0.08] text-slate-300 hover:text-white border-white/[0.08]'
                      }`}
                    >
                      # {cat.nama}
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Daftar Thread Sesuai Kategori */}
            <section className="space-y-4">
              {threads.length > 0 ? (
                threads.map((thread) => (
                  <article
                    key={thread.id}
                    className="group backdrop-blur-2xl bg-gradient-to-b from-white/[0.045] to-white/[0.02] hover:from-white/[0.07] hover:to-violet-950/20 border border-white/[0.09] border-t-white/15 hover:border-fuchsia-400/35 rounded-3xl p-6 transition-all shadow-xl"
                  >
                    <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="px-3 py-1 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 font-semibold border border-fuchsia-400/25 backdrop-blur-md">
                          {kategori?.nama}
                        </span>
                        <span>
                          oleh{' '}
                          <strong className="text-slate-200">
                            @{thread.penulis || 'mahasiswa'}
                          </strong>
                        </span>
                      </div>
                      <time dateTime={thread.createdAt.toISOString()}>
                        {new Date(thread.createdAt).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    </div>

                    <h2 className="text-lg sm:text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                      {thread.judul}
                    </h2>
                    <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                      {thread.konten}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-white/[0.07] text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 hover:text-white transition-colors font-medium">
                          💬 0 Komentar
                        </span>
                        <span className="flex items-center gap-1.5 text-slate-500">
                          👁️ {thread.views ?? 0} dilihat
                        </span>
                      </div>
                      <span className="text-fuchsia-400 group-hover:text-amber-300 font-semibold group-hover:translate-x-1.5 transition-all flex items-center gap-1">
                        Baca selengkapnya &rarr;
                      </span>
                    </div>
                  </article>
                ))
              ) : (
                <div className="text-center py-20 backdrop-blur-2xl bg-white/[0.03] border border-white/[0.09] border-t-white/15 rounded-3xl p-8 shadow-2xl">
                  <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                    📭
                  </div>
                  <h3 className="font-semibold text-white mb-1">
                    Belum ada thread di kategori #{kategori.nama}
                  </h3>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                    Jadilah yang pertama membuka obrolan di sub-forum ini!
                  </p>
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </>
  );
}

export default function KategoriDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <div className="min-h-screen bg-[#09080f] text-slate-100 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/12 rounded-full blur-[120px] pointer-events-none"></div>

      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-2xl border-2 border-violet-500/30 border-t-fuchsia-400 animate-spin"></div>
            <p className="text-sm font-medium tracking-wide">Memuat thread kategori...</p>
          </div>
        }
      >
        <KategoriThreadList params={params} />
      </Suspense>
    </div>
  );
}