import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/PageShell';

export const metadata = { title: 'Trending' };

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
  const urutanLatar = ['bg-sun', 'bg-mint', 'bg-coral'];

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight tracking-tight">
          Trending
        </h1>
        <p className="mt-3 mb-8 text-lg text-ink/70 max-w-xl">
          Topik dengan thread terbanyak. Jumlah dilihat dipakai kalau jumlah thread sama.
        </p>

        {trendingTopics.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-ink/40 bg-white p-10 text-center">
            <h2 className="font-display text-xl font-bold mb-1">Belum ada topik</h2>
            <p className="text-sm text-ink/65 max-w-xs mx-auto">
              Topik muncul setelah ada thread di salah satu kategori.
            </p>
          </div>
        ) : (
          <ol className="grid gap-3">
            {trendingTopics.map((topic, index) => {
              const percentage =
                topic.count > 0 ? Math.max(Math.round((topic.count / maxCount) * 100), 6) : 0;
              const latarNomor = index < 3 ? urutanLatar[index] : 'bg-paper';
              return (
                <li key={topic.slug}>
                  <Link
                    href={`/thread-tag?tag=${encodeURIComponent(topic.slug)}`}
                    className="group flex items-stretch rounded-xl border-2 border-ink bg-white shadow-hard-sm overflow-hidden transition-all hover:-translate-y-0.5"
                  >
                    <div
                      className={`w-14 sm:w-16 shrink-0 grid place-items-center border-r-2 border-ink font-display text-2xl font-extrabold tabular-nums ${latarNomor}`}
                    >
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1 px-4 py-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <span className="min-w-0 text-lg font-display font-bold break-words group-hover:underline underline-offset-4">
                          {topic.label}
                        </span>
                        <span className="shrink-0 text-sm tabular-nums text-ink/65">
                          {topic.count} thread, {topic.totalViews} dilihat
                        </span>
                      </div>
                      <div className="mt-3 h-2.5 rounded-full border-2 border-ink bg-paper overflow-hidden" aria-hidden="true">
                        <div className="h-full bg-cobalt" style={{ width: `${percentage}%` }} />
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ol>
        )}
      </main>
      <Footer />
    </>
  );
}

export default function TrendingTopicPage() {
  return (
    <div className="min-h-screen flex flex-col text-ink">
      <Suspense
        fallback={
          <div className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 text-ink/65">
            <div className="w-10 h-10 rounded-lg border-4 border-ink/15 border-t-cobalt animate-spin" />
            <p className="text-sm font-semibold">Memuat topik...</p>
          </div>
        }
      >
        <TrendingTopicContent />
      </Suspense>
    </div>
  );
}