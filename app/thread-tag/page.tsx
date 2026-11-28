import { Suspense } from 'react';
import Link from 'next/link';
import { connection } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/PageShell';

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
    <div className="min-h-screen text-ink flex flex-col">
      <Navbar />

      <main className="w-full max-w-5xl mx-auto px-5 py-8 flex-1">
        <section className="rounded-xl border-2 border-ink bg-sun shadow-hard p-6 sm:p-8 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-ink/65 mb-2">
              <Link href="/" className="text-cobalt hover:underline underline-offset-4">Beranda</Link> /{' '}
              <Link href="/tag-popular" className="text-cobalt hover:underline underline-offset-4">Tag Populer</Link> /{' '}
              <span>{displayTitle}</span>
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-extrabold text-ink">
              #{displayTitle}
            </h1>
            <p className="text-sm text-ink/70 mt-1.5">
              Menampilkan {filteredThreads.length} diskusi terkait topik ini
            </p>
          </div>

          <Link
            href="/buat-thread"
            className="btn-hard rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-ink"
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
                    ? 'bg-ink text-paper border-2 border-ink'
                    : 'bg-white text-ink border-2 border-ink hover:bg-sun'
                }`}
              >
                #{cat.nama}
              </Link>
            );
          })}
        </div>

        {filteredThreads.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-ink/40 bg-white p-12 text-center text-ink/65 text-sm">
            Belum ada diskusi untuk tag <strong className="text-ink">#{displayTitle}</strong>. Jadilah yang pertama membuat diskusi!
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
                  className="group rounded-xl bg-white border-2 border-ink shadow-hard-sm hover:shadow-hard hover:-translate-y-0.5 p-5 flex items-start gap-4 transition-all"
                >
                  <div className="w-11 h-11 rounded-full border-2 border-ink bg-cobalt text-white shrink-0 flex items-center justify-center font-extrabold text-sm">
                    {item.penulis.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      {kategori && (
                        <span className="rounded-md bg-cobalt/10 border border-cobalt/40 px-2.5 py-0.5 text-xs font-bold text-cobalt">
                          {kategori.nama}
                        </span>
                      )}
                      <h2 className="text-lg font-bold text-ink group-hover:text-cobalt transition-colors">{item.judul}</h2>
                    </div>

                    <p className="text-sm text-ink/65 mb-3 leading-relaxed line-clamp-2">
                      {item.konten}
                    </p>

                    <div className="flex flex-wrap items-center gap-3.5 text-xs text-ink/55">
                      <span className="font-bold text-cobalt">{item.penulis}</span>
                      <span>{formattedDate}</span>
                      <span>
                        <strong className="text-cobalt">{item.views}</strong> dilihat
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
        <div className="min-h-screen text-ink/70 flex items-center justify-center">
          Memuat daftar diskusi...
        </div>
      }
    >
      <ThreadTagContent searchParams={searchParams} />
    </Suspense>
  );
}