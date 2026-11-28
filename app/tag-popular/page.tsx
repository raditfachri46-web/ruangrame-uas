import { Suspense } from 'react';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import TagPopularClient, { TagItem } from './TagPopularClient';
import { PageShell } from '@/components/PageShell';
import { PageHeading } from '@/components/ui';

export const metadata = { title: 'Tag populer' };

async function TagPopularContent() {
  await connection();

  const [categories, threads] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { id: 'asc' } }),
    prisma.thread.findMany({
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
    <PageShell aktif="tag">
      <PageHeading
        judul="Tag populer"
        deskripsi="Dihitung dari kategori dan hashtag (#) di judul atau isi thread."
      />
      <Suspense fallback={<p className="text-pudar">Memuat tag</p>}>
        <TagPopularContent />
      </Suspense>
    </PageShell>
  )
}
