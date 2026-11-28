import type { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'

export function Footer() {
  return (
    <footer className="border-t-2 border-ink bg-ink text-paper mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-display text-2xl font-extrabold tracking-tight">RuangRame</p>
          <p className="text-sm text-paper/65 mt-1 max-w-xs">
            Forum diskusi kampus untuk tugas, mata kuliah, dan info yang perlu dibagi.
          </p>
        </div>
        <p className="text-xs text-paper/50">Tetap sopan, satu topik per thread.</p>
      </div>
    </footer>
  )
}

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col text-ink">
      <Navbar />
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {children}
      </main>
      <Footer />
    </div>
  )
}