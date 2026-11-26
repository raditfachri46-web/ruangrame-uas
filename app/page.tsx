import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { ThreadCard } from '@/components/ThreadCard';

async function ForumContent() {
  await connection(); // data DB selalu diambil saat request, bukan saat build

  let categories: { id: number; nama: string; slug: string }[] = [];
  let threads: {
    id: number;
    judul: string;
    konten: string;
    penulis: string;
    views: number;
    createdAt: Date;
    kategori: { nama: string } | null;
  }[] = [];
  let isConnected = true;

  try {
    categories = await prisma.kategori.findMany();
    threads = await prisma.thread.findMany({
      include: { kategori: true },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
  } catch {
    isConnected = false;
  }

  return (
    <>
      {/* Glass Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#09080f]/75 border-b border-white/[0.09] shadow-2xl">
        <div className="max-w-6xl mx-auto px-6 min-h-20 py-3 flex flex-wrap items-center justify-between gap-3">
          <Link href="/" className="flex items-center space-x-3.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-500/25 border border-white/25 group-hover:scale-105 transition-transform">
              R
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent">
              RuangRame
            </span>
          </Link>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <nav className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs font-semibold">
              <Link
                href="/"
                className="px-3.5 py-2 rounded-full bg-violet-500/20 text-violet-200 border border-violet-400/30"
              >
                Beranda
              </Link>
              <Link
                href="/kategori"
                className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Kategori
              </Link>
              <Link
                href="/tag-popular"
                className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Tag Populer
              </Link>
              <Link
                href="/trending-topic"
                className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Trending
              </Link>
              <Link
                href="/search"
                className="px-3.5 py-2 rounded-full text-slate-300 hover:text-white hover:bg-white/[0.06] transition-all"
              >
                Cari
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

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
        {/* Left Sidebar: Glass Categories */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] border-t-white/20 rounded-3xl p-6 shadow-[0_8px_32px_0_rgba(0,0,0,0.45)]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-2">
                📂 Kategori Populer
              </h3>
              <Link
                href="/kategori"
                className="text-[11px] font-semibold text-violet-300 hover:text-amber-300 transition-colors"
              >
                Semua &rarr;
              </Link>
            </div>

            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/kategori/${cat.slug}`}
                    className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-300 hover:text-white hover:bg-violet-500/10 transition-all group border border-transparent hover:border-violet-400/25"
                  >
                    <span># {cat.nama}</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-400/25 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-200 transition-colors">
                      Hot
                    </span>
                  </Link>
                ))
              ) : (
                <div className="space-y-3 py-2">
                  <p className="text-sm text-slate-500 italic">Belum ada kategori.</p>
                  <Link
                    href="/kategori"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-violet-300 hover:text-fuchsia-300 transition-colors"
                  >
                    Buka halaman sub-forum &rarr;
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="backdrop-blur-2xl bg-gradient-to-br from-violet-950/35 via-fuchsia-950/20 to-amber-950/15 border border-violet-400/25 border-t-white/15 rounded-3xl p-6 text-sm text-slate-300 shadow-xl">
            <h4 className="font-bold text-white mb-1 flex items-center gap-2">💡 Tips Mahasiswa</h4>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Eksplorasi diskusi seru tanpa batas, tetap jaga kesopanan antar sesama anggota ya!
            </p>
          </div>
        </aside>

        {/* Right Content: Feed */}
        <section className="lg:col-span-3 space-y-6">
          {/* Glass Hero Banner */}
          <div className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-violet-950/45 via-fuchsia-950/25 to-zinc-900/50 border border-white/[0.1] border-t-white/25 rounded-3xl p-8 sm:p-10 shadow-2xl">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none"></div>
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/25 text-violet-200 text-xs font-semibold mb-4 backdrop-blur-md">
                ✨ Forum Diskusi Kampus
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-3">
                Ngobrol Santai & Berbagi Info Tanpa Batas
              </h1>
              <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed mb-6">
                Wadah kolaborasi anak kuliah untuk nanya tugas, diskusi seputar mata kuliah, hingga berbagi info penting seputar kampus.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <Link
                  href="/buat-thread"
                  className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/30 transition-all transform active:scale-95 border border-white/25"
                >
                  + Buat Diskusi Baru
                </Link>
                <Link
                  href="/kategori"
                  className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all"
                >
                  📂 Jelajahi Kategori
                </Link>
                <Link
                  href="/search"
                  className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-200 hover:text-white font-semibold text-sm border border-white/15 backdrop-blur-md transition-all"
                >
                  🔍 Cari Diskusi
                </Link>
              </div>
            </div>
          </div>

          {/* Section Header */}
          <div className="flex items-center justify-between pt-2 px-1">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              🔥 Diskusi Terbaru
            </h2>
            <span className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-violet-500/10 text-violet-200 border border-violet-400/20 backdrop-blur-md">
              Total: {threads.length} Diskusi
            </span>
          </div>

          {/* Thread Feed Cards */}
          <div className="space-y-4">
            {threads.length > 0 ? (
              threads.map((thread) => <ThreadCard key={thread.id} thread={thread} />)
            ) : (
              <div className="text-center py-20 backdrop-blur-2xl bg-white/[0.03] border border-white/[0.09] border-t-white/15 rounded-3xl p-8 shadow-2xl">
                <div className="w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-400/20 flex items-center justify-center mx-auto mb-4 text-2xl shadow-inner">
                  📭
                </div>
                <h4 className="font-semibold text-white mb-1">Belum ada thread diskusi</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto leading-relaxed">
                  Jadilah yang pertama membuat topik diskusi baru di forum RuangRame ini!
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
    </>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-[#09080f] text-slate-100 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/12 rounded-full blur-[120px] pointer-events-none"></div>

      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-2xl border-2 border-violet-500/30 border-t-fuchsia-400 animate-spin"></div>
            <p className="text-sm font-medium tracking-wide">Memuat forum RuangRame...</p>
          </div>
        }
      >
        <ForumContent />
      </Suspense>
    </div>
  );
}