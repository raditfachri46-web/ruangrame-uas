'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Footer } from '@/components/Footer';

export interface TagItem {
  slug: string;
  label: string;
  count: number;
}

export default function TagPopularClient({ initialTags }: { initialTags: TagItem[] }) {
  const [search, setSearch] = useState('');

  const filteredTags = initialTags.filter(
    (t) =>
      t.label.toLowerCase().includes(search.toLowerCase().trim()) ||
      t.slug.toLowerCase().includes(search.toLowerCase().trim())
  );

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

        <div className="relative w-full sm:w-60">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-500">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari tag..."
            className="w-full rounded-full bg-[#181226] border border-purple-500/20 pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
          />
        </div>
      </nav>

      <main className="w-full max-w-5xl mx-auto px-5 py-8 flex-1">
        <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-[#130e1d] via-[#130e1d] to-purple-950/40 p-8 mb-8 shadow-xl">
          <div className="text-xs text-slate-400 mb-3">
            <Link href="/" className="text-purple-400 hover:underline">Beranda</Link> / Tag Populer
          </div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-purple-500/15 border border-purple-500/35 px-3.5 py-1 text-xs font-semibold text-purple-200 mb-3">
            ✨ Eksplorasi Topik Kampus
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">Tag Populer</h1>
          <p className="text-sm text-slate-400">Klik tag buat lihat semua thread diskusi dengan topik yang sesuai.</p>
        </section>

        {filteredTags.length === 0 ? (
          <div className="rounded-2xl border border-purple-500/20 bg-[#130e1d] p-12 text-center text-slate-400 text-sm">
            Tag yang kamu cari tidak ditemukan.
          </div>
        ) : (
          <section className="flex flex-wrap gap-3.5">
            {filteredTags.map((tag) => (
              <Link
                key={tag.slug}
                href={`/thread-tag?tag=${encodeURIComponent(tag.slug)}`}
                className="inline-flex items-center gap-3 rounded-full bg-[#181226] hover:bg-[#211934] border border-purple-500/20 hover:border-fuchsia-500/50 px-5 py-3 text-sm font-semibold text-white transition transform hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/15"
              >
                <span>{tag.label}</span>
                <span className="rounded-full bg-purple-500/20 border border-fuchsia-400/30 px-2.5 py-0.5 text-xs font-bold text-fuchsia-300">
                  {tag.count}
                </span>
              </Link>
            ))}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}