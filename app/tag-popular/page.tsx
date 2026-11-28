import { Suspense } from 'react';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import TagPopularClient, { TagItem } from './TagPopularClient';

async function TagPopularContent() {
  await connection();

  const [categories, threads] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { id: 'asc' } }),
    prisma.thread.findMany({
      where: { deletedAt: null },
      select: { kategoriId: true, judul: true, konten: true },
    }),
  ]);

  const categoryCountMap = new Map<number, number>();
  const hashtagMap = new Map<string, { label: string; count: number }>();

  for (const thread of threads) {
    categoryCountMap.set(
      thread.kategoriId,
      (categoryCountMap.get(thread.kategoriId) ?? 0) + 1
    );

    const combinedText = `${thread.judul} ${thread.konten}`;
    const matches = combinedText.match(/#([a-zA-Z0-9_-]+)/g) ?? [];
    const uniqueTags = new Set(matches.map((m) => m.slice(1).toLowerCase()));

    for (const slug of uniqueTags) {
      const existing = hashtagMap.get(slug);
      if (existing) {
        existing.count += 1;
      } else {
        hashtagMap.set(slug, { label: `#${slug}`, count: 1 });
      }
    }
  }

  const tagMap = new Map<string, TagItem>();

  for (const cat of categories) {
    tagMap.set(cat.slug, {
      slug: cat.slug,
      label: `#${cat.nama}`,
      count: categoryCountMap.get(cat.id) ?? 0,
    });
  }

  for (const [slug, info] of hashtagMap.entries()) {
    if (!tagMap.has(slug)) {
      tagMap.set(slug, { slug, label: info.label, count: info.count });
    }
  }

  const sortedTags = Array.from(tagMap.values()).sort((a, b) => b.count - a.count);

  return <TagPopularClient initialTags={sortedTags} />;
}

export default function TagPopularPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#09060e] text-slate-300 flex items-center justify-center">
          Memuat tag populer...
        </div>
      }
    >
      <TagPopularContent />
    </Suspense>
  );
}