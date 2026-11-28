'use client'

import { useState } from 'react'
import Link from 'next/link'

export interface TagItem {
  slug: string
  label: string
  count: number
}

export default function TagPopularClient({ initialTags }: { initialTags: TagItem[] }) {
  const [cari, setCari] = useState('')
  const kata = cari.toLowerCase().trim()
  const tagTampil = initialTags.filter(
    (t) => t.label.toLowerCase().includes(kata) || t.slug.toLowerCase().includes(kata)
  )

  return (
    <div>
      <div className="max-w-sm">
        <label htmlFor="cari-tag" className="label-isian">
          Cari tag
        </label>
        <input
          id="cari-tag"
          type="search"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          placeholder="Contoh: uas"
          className="isian"
        />
      </div>

      {tagTampil.length === 0 ? (
        <p className="mt-8 text-pudar">Tidak ada tag yang cocok dengan &ldquo;{cari}&rdquo;.</p>
      ) : (
        <ul className="mt-8 border-t border-garis bg-putih sm:columns-2 lg:columns-3 sm:gap-x-8">
          {tagTampil.map((tag) => (
            <li key={tag.slug} className="break-inside-avoid border-b border-garis">
              <Link
                href={`/thread-tag?tag=${encodeURIComponent(tag.slug)}`}
                className="flex items-baseline justify-between gap-3 px-1 py-3 hover:underline"
              >
                <span className="min-w-0 font-medium break-words text-pulpen">{tag.label}</span>
                <span className="shrink-0 text-sm tabular-nums text-pudar">{tag.count} thread</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
