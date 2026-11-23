'use client';

import React from 'react';
import Link from 'next/link';

interface TrendingItem {
  slug: string;
  label: string;
  count: number;
}

const TRENDING_TOPICS: TrendingItem[] = [
  { slug: 'coding', label: '#Coding', count: 342 },
  { slug: 'esport', label: '#Esport', count: 289 },
  { slug: 'startup', label: '#Startup', count: 256 },
  { slug: 'game', label: '#Game', count: 210 },
  { slug: 'kuliah', label: '#Kuliah', count: 198 },
  { slug: 'k-pop', label: '#K-Pop', count: 176 },
  { slug: 'film-series', label: '#Film & Series', count: 164 },
  { slug: 'resep', label: '#Resep', count: 143 },
];

export default function TrendingTopicPage() {
  const maxCount = Math.max(...TRENDING_TOPICS.map((t) => t.count));

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
          <Link href="/tag-popular" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Tag Populer
          </Link>
          <Link href="/trending-topic" className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 text-white font-medium">
            Trending
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
          <p className="text-sm text-slate-400">Ranking topik paling rame minggu ini, berdasarkan jumlah thread.</p>
        </section>

        <section className="flex flex-col gap-3.5">
          {TRENDING_TOPICS.map((topic, index) => {
            const rank = index + 1;
            const percentage = Math.round((topic.count / maxCount) * 100);
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
                <div className={`w-8 text-center text-xl font-extrabold shrink-0 ${rankColor}`}> {rank} </div>  <div className="flex-1 min-w-0"> <div className="text-base font-bold text-white mb-2.5">{topic.label}</div> <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden"> <div className="h-full rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-rose-500 shadow-[0_0_10px_rgba(236,72,153,0.45)]" style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-right shrink-0 min-w-16">
                  <span className="block text-base font-extrabold text-fuchsia-300">{topic.count}</span>
                  <span className="text-xs text-slate-500">thread</span>
                </div>
              </Link>
            );
          })}
        </section>
      </main>

      <footer className="border-t border-purple-500/20 py-6 px-5 text-center text-xs text-slate-500">
        © 2026 RuangRame — Project Forum Diskusi Kampus.
      </footer>
    </div>
  );
}