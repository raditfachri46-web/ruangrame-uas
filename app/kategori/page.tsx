import { Suspense } from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';

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

  const subForumIcons = ['🎓', '💻', '📢', '🤝', '📚', '💡', '🔥', '🎯'];

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
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/" className="hover:text-violet-300 transition-colors">
            Beranda
          </Link>
          <span>/</span>
          <span className="text-fuchsia-300 font-semibold">Daftar Kategori & Sub-forum</span>
        </nav>

        {/* Directory Hero Header */}
        <section className="relative overflow-hidden backdrop-blur-2xl bg-gradient-to-br from-violet-950/50 via-fuchsia-950/25 to-zinc-900/50 border border-white/[0.1] border-t-white/25 rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="absolute -top-12 -right-12 w-72 h-72 bg-fuchsia-500/15 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-violet-500/15 border border-violet-400/25 text-violet-200 text-xs font-semibold mb-3 backdrop-blur-md">
                🗂️ Direktori Sub-Forum
              </span>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2.5">
                Jelajahi Semua Kategori Diskusi
              </h1>
              <p className="text-sm sm:text-base text-slate-300/85 leading-relaxed">
                Pilih sub-forum sesuai topik yang ingin kamu bahas—mulai dari informasi perkuliahan, tanya jawab tugas, hingga diskusi santai antar mahasiswa.
              </p>
            </div>

            {/* Ringkasan Statistik */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3.5 text-center">
                <p className="text-2xl font-black text-white">{categories.length}</p>
                <p className="text-[11px] font-medium text-violet-300 uppercase tracking-wider">
                  Kategori
                </p>
              </div>
              <div className="backdrop-blur-xl bg-white/[0.04] border border-white/10 rounded-2xl px-5 py-3.5 text-center">
                <p className="text-2xl font-black text-fuchsia-300">{threads.length}</p>
                <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                  Total Thread
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Grid Daftar Kategori */}
        {kategoriWithStats.length > 0 ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {kategoriWithStats.map((cat, index) => {
              const icon = subForumIcons[index % subForumIcons.length];
              return (
                <Link
                  key={cat.id}
                  href={`/kategori/${cat.slug}`}
                  className="group relative flex flex-col justify-between backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] hover:from-white/[0.08] hover:to-violet-950/25 border border-white/[0.09] border-t-white/20 hover:border-fuchsia-400/40 rounded-3xl p-6 transition-all duration-300 hover:-translate-y-1 shadow-xl"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-violet-600/25 to-fuchsia-500/25 border border-violet-400/30 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
                        {icon}
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-violet-500/15 text-violet-200 border border-violet-400/25">
                        {cat.totalThreads} Thread
                      </span>
                    </div>

                    <h2 className="text-xl font-bold text-white group-hover:text-violet-300 transition-colors mb-1.5">
                      # {cat.nama}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed mb-5">
                      Sub-forum resmi untuk seluruh diskusi, pertanyaan, dan berbagi informasi seputar{' '}
                      <span className="text-slate-300 font-medium">{cat.nama}</span>.
                    </p>
                  </div>

                  {/* Preview Thread Terbaru di Kategori Ini */}
                  <div className="pt-4 border-t border-white/[0.07] space-y-3">
                    {cat.latestThread ? (
                      <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] px-3.5 py-2.5">
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-fuchsia-300 mb-0.5">
                          Diskusi Terbaru
                        </p>
                        <p className="text-xs text-slate-200 font-medium line-clamp-1">
                          {cat.latestThread.judul}
                        </p>
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-white/[0.02] border border-white/[0.05] px-3.5 py-2.5">
                        <p className="text-xs text-slate-500 italic">
                          Belum ada diskusi di sub-forum ini
                        </p>
                      </div>
                    )}

                    <div className="flex items-center justify-between text-xs font-semibold text-fuchsia-400 group-hover:text-amber-300 transition-colors pt-1">
                      <span>Masuk Sub-forum</span>
                      <span className="group-hover:translate-x-1.5 transition-transform">
                        &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        ) : (
          <div className="text-center py-20 backdrop-blur-2xl bg-white/[0.03] border border-white/[0.09] border-t-white/15 rounded-3xl p-8 shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center mx-auto mb-4 text-3xl">
              📂
            </div>
            <h2 className="font-bold text-lg text-white mb-1.5">Belum ada kategori sub-forum</h2>
            <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed mb-6">
              Tambahkan baris kategori pada tabel <code className="text-violet-300">Kategori</code> di Supabase agar muncul di halaman ini.
            </p>
            <Link
              href="/"
              className="inline-flex px-5 py-2.5 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white text-xs font-semibold shadow-lg shadow-fuchsia-600/25 border border-white/20"
            >
              &larr; Kembali ke Beranda
            </Link>
          </div>
        )}
      </main>
    </>
  );
}

export default function DaftarKategoriPage() {
  return (
    <div className="min-h-screen bg-[#09080f] text-slate-100 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      {/* Background Glowing Ambient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/12 rounded-full blur-[120px] pointer-events-none"></div>

      <Suspense
        fallback={
          <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400">
            <div className="w-10 h-10 rounded-2xl border-2 border-violet-500/30 border-t-fuchsia-400 animate-spin"></div>
            <p className="text-sm font-medium tracking-wide">Memuat daftar kategori...</p>
          </div>
        }
      >
        <KategoriDirectoryContent />
      </Suspense>
    </div>
  );
}