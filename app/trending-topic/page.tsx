import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PageShell } from '@/components/PageShell';
import { EmptyState, PageHeading } from '@/components/ui';

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
    <div className="max-w-3xl">
      <PageHeading
        judul="Trending"
        deskripsi="Topik dengan thread terbanyak. Jumlah dilihat dipakai kalau jumlah thread sama."
      />

      {trendingTopics.length === 0 ? (
        <EmptyState judul="Belum ada topik" deskripsi="Topik muncul setelah ada thread di salah satu kategori." />
      ) : (
        <ol className="lembar">
          {trendingTopics.map((topic, index) => {
            const percentage =
              topic.count > 0 ? Math.max(Math.round((topic.count / maxCount) * 100), 6) : 0
            return (
              <li key={topic.slug}>
                <Link
                  href={`/thread-tag?tag=${encodeURIComponent(topic.slug)}`}
                  className="lembar-baris group"
                >
                  <div className="lembar-margin">
                    <span className="text-xl leading-none font-bold tabular-nums">{index + 1}</span>
                  </div>
                  <div className="min-w-0 px-4 py-4">
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="min-w-0 text-lg font-bold break-words group-hover:underline">
                        {topic.label}
                      </span>
                      <span className="shrink-0 text-sm tabular-nums text-pudar">
                        {topic.count} thread, {topic.totalViews} dilihat
                      </span>
                    </div>
                    <div className="mt-3 h-1.5 bg-garis/60" aria-hidden="true">
                      <div className="h-full bg-pulpen" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                </Link>
              </li>
            )
          })}
        </ol>
      )}
    </div>
  )
}

export const metadata = { title: 'Trending' }

export default function TrendingTopicPage() {
  return (
    <PageShell aktif="trending">
      <Suspense fallback={<p className="text-pudar">Memuat topik</p>}>
        <TrendingTopicContent />
      </Suspense>
    </PageShell>
  )
}
