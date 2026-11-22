'use client'

import { useEffect } from 'react'
import { tambahView } from '@/app/thread/actions'

// Menambah jumlah views 1x per tab browser (dijaga pakai sessionStorage)
export function ViewCounter({ threadId }: { threadId: number }) {
  useEffect(() => {
    const kunci = `rr-view-${threadId}`
    try {
      if (sessionStorage.getItem(kunci)) return
      sessionStorage.setItem(kunci, '1')
    } catch {
      // sessionStorage diblokir: tetap lanjut hitung
    }
    void tambahView(threadId)
  }, [threadId])

  return null
}
