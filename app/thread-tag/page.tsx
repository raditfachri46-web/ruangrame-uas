'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ThreadItem {
  id: string;
  pinned: boolean;
  author: string;
  time: string;
  title: string;
  excerpt: string;
  replies: number;
  views: number;
  votes: number;
}

const THREADS_BY_TAG: Record<string, ThreadItem[]> = {
  coding: [
    {
      id: '1',
      pinned: true,
      author: 'rafif_dev',
      time: '12 menit lalu',
      title: 'Laptop 8 jutaan yang worth it buat kuliah SI, ada rekomendasi?',
      excerpt: 'Butuh laptop buat coding sama desain ringan, budget mepet nih gaes...',
      replies: 34,
      views: 891,
      votes: 128,
    },
    {
      id: '2',
      pinned: false,
      author: 'chris.reinner',
      time: '1 jam lalu',
      title: '[WTS] Keyboard mechanical 2nd, kondisi 95%, harga nego',
      excerpt: 'Jual karena ganti unit baru, komplit box dan kabel braided original...',
      replies: 8,
      views: 220,
      votes: 22,
    },
    {
      id: '3',
      pinned: false,
      author: 'chris.reinner',
      time: '4 jam lalu',
      title: 'Mr. Robot cocok banget buat anak SI, tapi jangan nonton sambil main HP',
      excerpt: 'Adegan keamanan sibernya terasa realistis, alurnya bikin mikir keras...',
      replies: 37,
      views: 920,
      votes: 138,
    },
    {
      id: '4',
      pinned: false,
      author: 'tristan.a',
      time: '6 jam lalu',
      title: 'Framework CSS vs vanilla CSS, kalian tim mana?',
      excerpt: 'Lagi kerjain tugas UTS pakai vanilla doang, capek tapi puas banget hasilnya...',
      replies: 45,
      views: 980,
      votes: 150,
    },
  ],
  default: [
    {
      id: '101',
      pinned: true,
      author: 'admin_kampus',
      time: '30 menit lalu',
      title: 'Diskusi Utama & Sharing Seputar Topik Ini',
      excerpt: 'Silakan bagikan pengalaman, pertanyaan, atau referensi menarik kamu di sini!',
      replies: 19,
      views: 412,
      votes: 64,
    },
    {
      id: '102',
      pinned: false,
      author: 'mahasiswa_untar',
      time: '2 jam lalu',
      title: 'Ada yang mau mabar atau diskusi bareng weekend ini?',
      excerpt: 'Cari temen satu frekuensi buat ngobrol santai selepas kelas...',
      replies: 11,
      views: 185,
      votes: 29,
    },
  ],
};

function ThreadTagContent() {
  const searchParams = useSearchParams();
  const rawTag = (searchParams.get('tag') || 'coding').toLowerCase();
  const formattedTag = rawTag
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const threads = THREADS_BY_TAG[rawTag] || THREADS_BY_TAG.default;

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
          <Link href="/tag-popular" className="px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40 text-white font-medium">
            Tag Populer
          </Link>
          <Link href="/trending-topic" className="px-4 py-2 rounded-full text-slate-400 hover:text-white hover:bg-purple-500/15 transition">
            Trending
          </Link>
        </div>
      </nav>

      <main className="w-full max-w-5xl mx-auto px-5 py-8 flex-1">
        <section className="rounded-2xl border border-purple-500/20 bg-gradient-to-tr from-[#130e1d] via-[#130e1d] to-purple-950/40 p-8 mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-2">
              <Link href="/" className="text-purple-400 hover:underline">Beranda</Link> /{' '}
              <Link href="/tag-popular" className="text-purple-400 hover:underline">Tag</Link> /{' '}
              <span>{formattedTag}</span>
            </div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-white to-fuchsia-400 bg-clip-text text-transparent">
              #{formattedTag}
            </h1>
          </div>

          <Link
            href="/"
            className="rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-pink-600/30 hover:opacity-95 transition"
          >
            + Buat Diskusi Baru
          </Link>
        </section>

        <section className="flex flex-col gap-4">
          {threads.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl bg-[#181226] hover:bg-[#211934] border border-purple-500/20 hover:border-fuchsia-500/45 p-5 flex items-start gap-4 transition"
            >
              <div className="w-11 h-11 rounded-xl shrink-0 bg-gradient-to-br from-purple-700 to-pink-600 flex items-center justify-center font-extrabold text-sm text-white">
                {item.author.slice(0, 2).toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  {item.pinned && (
                    <span className="rounded-md bg-gradient-to-r from-orange-500 to-pink-500 px-2 py-0.5 text-[10px] font-extrabold tracking-wider text-white">
                      PINNED
                    </span>
                  )}
                  <h2 className="text-base font-bold text-white">{item.title}</h2>
                </div>

                <p className="text-sm text-slate-400 mb-3 leading-relaxed">{item.excerpt}</p>

                <div className="flex flex-wrap items-center gap-3.5 text-xs text-slate-500">
                  <span className="font-bold text-fuchsia-300">{item.author}</span>
                  <span>{item.time}</span>
                  <span><strong className="text-purple-300">{item.replies}</strong> balasan</span>
                  <span><strong className="text-purple-300">{item.views}</strong> dilihat</span>
                  <span><strong className="text-purple-300">{item.votes}</strong> vote</span>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="border-t border-purple-500/20 py-6 px-5 text-center text-xs text-slate-500">
        © 2026 RuangRame — Project Forum Diskusi Kampus.
      </footer>
    </div>
  );
}

export default function ThreadTagPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#09060e] text-slate-300 p-8">Memuat thread...</div>}>
      <ThreadTagContent />
    </Suspense>
  );
}