import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Suspense } from 'react'

// Komponen Async untuk mengambil data database
async function ContentList() {
  const kategoriList = await prisma.kategori.findMany().catch(() => [])
  const threadList = await prisma.thread.findMany({
    include: {
      kategori: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  }).catch(() => [])

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header / Banner Forum */}
      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 shadow-lg flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-emerald-400">RuangRame 💬</h1>
          <p className="text-slate-400 text-sm mt-1">
            Forum diskusinya anak mahasiswa, ngobrol santai, tanya jawab, dan berbagi info.
          </p>
        </div>
        <div className="text-right">
          <span className="inline-block bg-emerald-900/50 text-emerald-300 border border-emerald-700 text-xs px-3 py-1 rounded-full font-medium">
            Supabase Connected ✅
          </span>
        </div>
      </div>

      {/* Bagian Daftar Kategori */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-200">Kategori Populer</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {kategoriList.length > 0 ? (
            kategoriList.map((kat) => (
              <div 
                key={kat.id}
                className="bg-slate-800/80 border border-slate-700/85 hover:border-emerald-500/50 transition p-4 rounded-lg shadow-sm"
              >
                <h3 className="font-medium text-slate-100">{kat.nama}</h3>
                <span className="text-xs text-slate-400">/{kat.slug}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500 italic col-span-full">Belum ada kategori.</p>
          )}
        </div>
      </section>

      {/* Bagian Daftar Thread */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-200">Diskusi Terbaru</h2>
          <span className="text-xs text-slate-400">Total: {threadList.length} Diskusi</span>
        </div>

        <div className="space-y-3">
          {threadList.length > 0 ? (
            threadList.map((thread) => (
              <div 
                key={thread.id}
                className="bg-slate-800 border border-slate-700 p-5 rounded-xl shadow-md space-y-2"
              >
                <div className="flex justify-between items-start">
                  <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-md font-medium">
                    {thread.kategori?.nama || 'Umum'}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(thread.createdAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-slate-100">
                  {thread.judul}
                </h3>

                <p className="text-slate-300 text-sm line-clamp-2">
                  {thread.konten}
                </p>

                <div className="flex justify-between items-center pt-2 text-xs text-slate-400 border-t border-slate-700/60">
                  <span>Ditulis oleh: <strong className="text-slate-300">{thread.penulis}</strong></span>
                  <span>👁️ {thread.views} dilihat</span>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-8 text-center space-y-2">
              <p className="text-slate-400">Belum ada thread diskusi.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

// Halaman Utama dengan Suspense Boundary agar lolos prerender Next.js
export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12">
      <Suspense fallback={<div className="text-center text-slate-400 py-12">Memuat data forum...</div>}>
        <ContentList />
      </Suspense>
    </main>
  )
}