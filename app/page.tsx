import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';

async function ForumContent() {
  let categories: { id: number; nama: string; slug: string }[] = [];
  let threads: {
    id: number;
    judul: string;
    konten: string;
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
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 via-fuchsia-500 to-amber-400 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-violet-500/25 border border-white/25">
              R
            </div>
            <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-white via-violet-100 to-fuchsia-300 bg-clip-text text-transparent">
              RuangRame
            </span>
          </div>

          <div className="flex items-center space-x-4">
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
            <h3 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 mb-5 flex items-center gap-2">
              📂 Kategori Populer
            </h3>
            <div className="space-y-2">
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <a
                    key={cat.id}
                    href={`#${cat.slug}`}
                    className="flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-medium text-slate-300 hover:text-white hover:bg-violet-500/10 transition-all group border border-transparent hover:border-violet-400/25"
                  >
                    <span># {cat.nama}</span>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-violet-500/15 text-violet-300 border border-violet-400/25 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-200 transition-colors">
                      Hot
                    </span>
                  </a>
                ))
              ) : (
                <p className="text-sm text-slate-500 italic py-2">Belum ada kategori.</p>
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
              <div>
                <button className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-400 text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/30 transition-all transform active:scale-95 border border-white/25">
                  + Buat Diskusi Baru
                </button>
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
              threads.map((thread) => (
                <article
                  key={thread.id}
                  className="group backdrop-blur-2xl bg-gradient-to-b from-white/[0.045] to-white/[0.02] hover:from-white/[0.07] hover:to-violet-950/20 border border-white/[0.09] border-t-white/15 hover:border-fuchsia-400/35 rounded-3xl p-6 transition-all shadow-xl"
                >
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="px-3 py-1 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 font-semibold border border-fuchsia-400/25 backdrop-blur-md">
                      {thread.kategori?.nama || 'Umum'}
                    </span>
                    <time dateTime={thread.createdAt.toISOString()}>
                      {new Date(thread.createdAt).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </time>
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-2">
                    {thread.judul}
                  </h3>
                  <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {thread.konten}
                  </p>
                  <div className="flex items-center justify-between pt-4 border-t border-white/[0.07] text-xs text-slate-400">
                    <span className="flex items-center gap-2 hover:text-white transition-colors cursor-pointer font-medium">
                      💬 0 Komentar
                    </span>
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