import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Footer } from '@/components/Footer';

interface ThreadTagPageProps {
  searchParams: Promise<{ tag?: string }>;
}

async function ThreadTagContent({ searchParams }: ThreadTagPageProps) {
  await connection();
  const resolvedParams = await searchParams;

  const [categories, allThreads] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { id: 'asc' } }),
    prisma.thread.findMany({ where: { deletedAt: null }, orderBy: { createdAt: 'desc' } }),
  ]);

  const categoryById = new Map(categories.map((c) => [c.id, c]));
  const defaultSlug = categories[0]?.slug ?? 'teknologi-coding';
  const rawTag = (resolvedParams.tag || defaultSlug).toLowerCase().trim();

  const matchedCategory = categories.find((c) => c.slug.toLowerCase() === rawTag);
  const keyword = rawTag.replace(/-/g, ' ');

  const filteredThreads = allThreads.filter((thread) => {
    if (matchedCategory && thread.kategoriId === matchedCategory.id) {
      return true;
    }
    const text = `${thread.judul} ${thread.konten}`.toLowerCase();
    return text.includes(`#${rawTag}`) || text.includes(keyword);
  });

  const displayTitle = matchedCategory
    ? matchedCategory.nama
    : rawTag
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

  return (
    <div className="min-h-screen bg-[#09060e] text-slate-100 flex flex-col">
      <nav className="sticky top-0 z-50 border-b border-purple-500/20 bg-[#0d0916]/85 backdrop-blur-md px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 font-extrabold text-xl text-white">
          <span className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-sm shadow-lg shadow-purple-500/40">
            R
          </span>
          <span>RuangRame</span>
        </Link>

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <Link href="/" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Beranda
          </Link>
          <Link href="/kategori" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Kategori
          </Link>
          <Link href="/tag-popular" className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 text-white font-medium">
            Tag Populer
          </Link>
          <Link href="/trending-topic" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Trending
          </Link>
          <Link href="/search" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Cari
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-5xl mx-auto px-5 py-8 flex-1">
        <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-[#130e1d] via-[#130e1d] to-purple-950/40 p-8 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-2">
              <Link href="/" className="text-purple-400 hover:underline">Beranda</Link> /{' '}
              <Link href="/tag-popular" className="text-purple-400 hover:underline">Tag Populer</Link> /{' '}
              <span>{displayTitle}</span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-fuchsia-400 bg-clip-text text-transparent">
              #{displayTitle}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Menampilkan {filteredThreads.length} diskusi terkait topik ini
            </p>
          </div>

          <Link
            href="/buat-thread"
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-600/30 hover:opacity-95 transition"
          >
            + Buat Diskusi Baru
          </Link>
        </section>

        <div className="flex flex-wrap gap-2 mb-6">
          {categories.map((cat) => {
            const active = cat.slug.toLowerCase() === rawTag;
            return (
              <Link
                key={cat.id}
                href={`/thread-tag?tag=${encodeURIComponent(cat.slug)}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'bg-[#181226] text-slate-400 border border-purple-500/20 hover:text-white'
                }`}
              >
                #{cat.nama}
              </Link>
            );
          })}
        </div>

        {filteredThreads.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/20 bg-[#130e1d] p-12 text-center text-slate-400 text-sm">
            Belum ada diskusi untuk tag <strong className="text-white">#{displayTitle}</strong>. Jadilah yang pertama membuat diskusi!
          </div>
        ) : (
          <section className="flex flex-col gap-4">
            {filteredThreads.map((item) => {
              const kategori = categoryById.get(item.kategoriId);
              const formattedDate = new Date(item.createdAt).toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              });

              return (
                <Link
                  key={item.id}
                  href={`/thread/${item.id}`}
                  className="rounded-2xl bg-[#181226] hover:bg-[#211934] border border-purple-500/20 hover:border-fuchsia-500/45 p-5 flex items-start gap-4 transition"
                >
                  <div className="w-11 h-11 rounded-xl shrink-0 bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center font-extrabold text-sm text-white">
                    {item.penulis.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {kategori && (
                        <span className="rounded-full bg-purple-500/20 border border-purple-500/35 px-2.5 py-0.5 text-[11px] font-semibold text-purple-200">
                          {kategori.nama}
                        </span>
                      )}
                      <h2 className="text-base font-bold text-white">{item.judul}</h2>
                    </div>

                    <p className="text-sm text-slate-400 mb-3 leading-relaxed line-clamp-2">
                      {item.konten}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500">
                      <span className="font-bold text-fuchsia-300">{item.penulis}</span>
                      <span>{formattedDate}</span>
                      <span>
                        <strong className="text-purple-300">{item.views}</strong> dilihat
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ThreadTagPage({ searchParams }: ThreadTagPageProps) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09060e] text-slate-300 flex items-center justify-center">
          Memuat daftar diskusi...
        </div>
      }
    >
      <ThreadTagContent searchParams={searchParams} />
    </Suspense>
  );
}