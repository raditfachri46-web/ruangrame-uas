'use client'

import { useState } from 'react'

export function BagikanTombol({ judul }: { judul: string }) {
  const [status, setStatus] = useState<'diam' | 'tersalin' | 'gagal'>('diam')

  async function bagikan() {
    const url = window.location.href
    try {
      // Di HP, buka menu share bawaan. Di desktop, salin link.
      if (navigator.share && /Android|iPhone|iPad/i.test(navigator.userAgent)) {
        await navigator.share({ title: judul, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setStatus('tersalin')
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return
      setStatus('gagal')
    }
    setTimeout(() => setStatus('diam'), 2000)
  }

  return (
    <button
      type="button"
      onClick={bagikan}
      className="px-4 py-2.5 rounded-lg bg-white hover:bg-paper border border-ink/20 hover:border-cobalt/40 text-sm font-semibold text-ink transition-all active:scale-95"
    >
      {status === 'tersalin' ? '✅ Link tersalin!' : status === 'gagal' ? '⚠️ Gagal menyalin' : '🔗 Bagikan'}
    </button>
  )
}