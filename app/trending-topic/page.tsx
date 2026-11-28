import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Footer } from '@/components/Footer';

interface TrendingItem {
  slug: string;
  label: string;
  count: number;
  totalViews: number;
}

async function TrendingTopicContent() {
  await connection();

  const [categories, threads] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { id: 'asc' } }),
    prisma.thread.findMany({
      where: { deletedAt: null },
      select: { kategoriId: true, judul: true, konten: true, views: true },
    }),
  ]);

  const catStats = new Map<number, { count: number; totalViews: number }>();
  const hashtagStats = new Map<string, { label: string; count: number; totalViews: number }>();

  for (const thread of threads) {
    const prev = catStats.get(thread.kategoriId) ?? { count: 0, totalViews: 0 };
    catStats.set(thread.kategoriId, {
      count: prev.count + 1,
      totalViews: prev.totalViews + thread.views,
    });

    const combinedText = `${thread.judul} ${thread.konten}`;
    const matches = combinedText.match(/#([a-zA-Z0-9_-]+)/g) ?? [];
    const uniqueTags = new Set(matches.map((m) => m.slice(1).toLowerCase()));

    for (const slug of uniqueTags) {
      const existing = hashtagStats.get(slug);
      if (existing) {
        existing.count += 1;
        existing.totalViews += thread.views;
      } else {
        hashtagStats.set(slug, {
          label: `#${slug}`,
          count: 1,
          totalViews: thread.views,
        });
      }
    }
  }

  const topicMap = new Map<string, TrendingItem>();

  for (const cat of categories) {
    const stats = catStats.get(cat.id) ?? { count: 0, totalViews: 0 };
    topicMap.set(cat.slug, {
      slug: cat.slug,
      label: `#${cat.nama}`,
      count: stats.count,
      totalViews: stats.totalViews,
    });
  }

  for (const [slug, info] of hashtagStats.entries()) {
    if (!topicMap.has(slug)) {
      topicMap.set(slug, {
        slug,
        label: info.label,
        count: info.count,
        totalViews: info.totalViews,
      });
    }
  }

  const trendingTopics = Array.from(topicMap.values()).sort(
    (a, b) => b.count - a.count || b.totalViews - a.totalViews
  );

  const maxCount = Math.max(...trendingTopics.map((t) => t.count), 1);

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
          <Link href="/tag-popular" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Tag Populer
          </Link>
          <Link href="/trending-topic" className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 text-white font-medium">
            Trending
          </Link>
          <Link href="/search" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Cari
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-4xl mx-auto px-5 py-8 flex-1">
        <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-[#130e1d] via-[#130e1d] to-purple-950/40 p-8 mb-8">
          <div className="text-xs text-slate-400 mb-2">
            <Link href="/" className="text-purple-400 hover:underline">Beranda</Link> / Trending Topics
          </div>
          <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2.5">
            <span>🔥</span>
            <span>Trending Topics</span>
          </h1>
          <p className="text-sm text-slate-400">Ranking topik paling rame minggu ini, berdasarkan jumlah thread dan pembaca.</p>
        </section>

        <section className="flex flex-col gap-3.5">
          {trendingTopics.map((topic, index) => {
            const rank = index + 1;
            const percentage = topic.count > 0 ? Math.max(Math.round((topic.count / maxCount) * 100), 10) : 4;
            const rankColor =
              rank === 1
                ? 'text-yellow-400 drop-shadow-[0_0_10px_rgba(250,204,21,0.45)]'
                : rank === 2
                ? 'text-slate-200'
                : rank === 3
                ? 'text-orange-400'
                : 'text-slate-400';

            return (
              <Link
                key={topic.slug}
                href={`/thread-tag?tag=${encodeURIComponent(topic.slug)}`}
                className="rounded-2xl bg-[#181226] hover:bg-[#211934] border border-purple-500/20 hover:border-fuchsia-500/50 px-6 py-5 flex items-center gap-5 transition transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/15"
              >
                <div className={`w-8 text-center text-xl font-extrabold shrink-0 ${rankColor}`}>
                  {rank}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-base font-bold text-white mb-2.5">{topic.label}</div>
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 shadow-[0_0_10px_rgba(236,72,153,0.45)]"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0 min-w-20">
                  <span className="block text-base font-extrabold text-fuchsia-300">{topic.count}</span>
                  <span className="text-xs text-slate-500">thread • {topic.totalViews} views</span>
                </div>
              </Link>
            );
          })}
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default function TrendingTopicPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09060e] text-slate-300 flex items-center justify-center">
          Memuat trending topics...
        </div>
      }
    >
      <TrendingTopicContent />
    </Suspense>
  );
}