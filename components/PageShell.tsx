import type { ReactNode } from 'react'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#09080f] text-slate-100 relative overflow-hidden selection:bg-violet-500 selection:text-white">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-rose-500/12 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
