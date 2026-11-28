import Link from 'next/link'
import { prisma } from '@/lib/prisma'

// Server component kecil: hitung notifikasi belum dibaca milik user yang sedang login.
// Pakai polling ringan di sisi client (lihat note di bawah) kalau mau update tanpa reload,
// untuk sekarang cukup refresh saat pindah halaman (App Router re-render komponen ini tiap navigasi).
export async function NotificationBell({ userId }: { userId: number }) {
  const belumDibaca = await prisma.notification.count({
    where: { userId, isRead: false },
  })

  return (
    <Link
      href="/notifikasi"
      aria-label="Notifikasi"
      className="relative w-10 h-10 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] flex items-center justify-center text-base transition-all"
    >
      🔔
      {belumDibaca > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center border border-[#09080f]">
          {belumDibaca > 9 ? '9+' : belumDibaca}
        </span>
      )}
    </Link>
  )
}
