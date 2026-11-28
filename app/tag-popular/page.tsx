import { Suspense } from 'react';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import TagPopularClient, { TagItem } from './TagPopularClient';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/PageShell';

export const metadata = { title: 'Tag populer' };

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

  return (
    <>
      <Navbar />
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-10">
        <h1 className="font-display font-extrabold text-4xl sm:text-5xl leading-tight tracking-tight">
          Tag populer
        </h1>
        <p className="mt-3 mb-8 text-lg text-ink/70 max-w-xl">
          Dihitung dari kategori dan hashtag (#) di judul atau isi thread.
        </p>
        <TagPopularClient initialTags={sortedTags} />
      </main>
      <Footer />
    </>
  );
}

export default function TagPopularPage() {
  return (
    <div className="min-h-screen flex flex-col text-ink">
      <Suspense
        fallback={
          <div className="flex-1 min-h-screen flex flex-col items-center justify-center gap-4 text-ink/65">
            <div className="w-10 h-10 rounded-lg border-4 border-ink/15 border-t-cobalt animate-spin" />
            <p className="text-sm font-semibold">Memuat tag...</p>
          </div>
        }
      >
        <TagPopularContent />
      </Suspense>
    </div>
  );
}