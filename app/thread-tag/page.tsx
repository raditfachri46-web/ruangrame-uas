import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { prisma } from '@/lib/prisma'
import { PageShell } from '@/components/PageShell'
import { ThreadCard } from '@/components/ThreadCard'
import { Breadcrumb, EmptyState, PageHeading } from '@/components/ui'

interface ThreadTagPageProps {
  searchParams: Promise<{ tag?: string }>
}

async function ThreadTagContent({ searchParams }: ThreadTagPageProps) {
  await connection()
  const resolvedParams = await searchParams

  const [categories, allThreads] = await Promise.all([
    prisma.kategori.findMany({ orderBy: { id: 'asc' } }),
    prisma.thread.findMany({ orderBy: { createdAt: 'desc' } }),
  ])

  const categoryById = new Map(categories.map((c) => [c.id, c]))
  const defaultSlug = categories[0]?.slug ?? 'teknologi-coding'
  const rawTag = (resolvedParams.tag || defaultSlug).toLowerCase().trim()
  const matchedCategory = categories.find((c) => c.slug.toLowerCase() === rawTag)
  const keyword = rawTag.replace(/-/g, ' ')

  const filteredThreads = allThreads.filter((thread) => {
    if (matchedCategory && thread.kategoriId === matchedCategory.id) {
      return true
    }
    const text = `${thread.judul} ${thread.konten}`.toLowerCase()
    return text.includes(`#${rawTag}`) || text.includes(keyword)
  })

  const displayTitle = matchedCategory
    ? matchedCategory.nama
    : rawTag
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

  return (
    <div className="max-w-3xl">
      <Breadcrumb
        items={[
          { label: 'Beranda', href: '/' },
          { label: 'Tag', href: '/tag-popular' },
          { label: `#${displayTitle}` },
        ]}
      />
      <PageHeading
        judul={`#${displayTitle}`}
        deskripsi={`${filteredThreads.length} thread dengan topik ini`}
        aksi={
          <Link href="/buat-thread" className="btn-utama">
            Buat thread
          </Link>
        }
      />

      <nav aria-label="Kategori" className="-mx-2.5 mb-6 flex gap-1 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/thread-tag?tag=${encodeURIComponent(cat.slug)}`}
            aria-current={cat.slug.toLowerCase() === rawTag ? 'page' : undefined}
            className="filter-tab whitespace-nowrap"
          >
            {cat.nama}
          </Link>
        ))}
      </nav>

      {filteredThreads.length === 0 ? (
        <EmptyState
          judul={`Belum ada thread untuk #${displayTitle}`}
          deskripsi="Buat thread dan tulis tagnya dengan tanda # di judul atau isi."
        />
      ) : (
        <ul className="lembar">
          {filteredThreads.map((item) => (
            <ThreadCard
              key={item.id}
              thread={{ ...item, kategori: categoryById.get(item.kategoriId) ?? null }}
            />
          ))}
        </ul>
      )}
    </div>
  )
}

export const metadata = { title: 'Thread per tag' }

export default function ThreadTagPage({ searchParams }: ThreadTagPageProps) {
  return (
    <PageShell aktif="tag">
      <Suspense fallback={<p className="text-pudar">Memuat thread</p>}>
        <ThreadTagContent searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
