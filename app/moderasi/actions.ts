'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, isModerator } from '@/lib/session'
import { createNotification } from '@/lib/notifications'

export type AksiLaporan = 'selesai' | 'tolak' | 'hapus_konten'

export async function prosesLaporan(reportId: number, aksi: AksiLaporan) {
  const moderator = await getCurrentUser()
  if (!moderator || !isModerator(moderator)) {
    throw new Error('Tidak punya akses moderasi.')
  }

  const laporan = await prisma.report.findUnique({
    where: { id: reportId },
    include: {
      reporter: { select: { id: true } },
      thread: { select: { id: true, userId: true, judul: true } },
      comment: { select: { id: true, userId: true, threadId: true } },
    },
  })
  if (!laporan) throw new Error('Laporan tidak ditemukan.')

  const statusBaru = aksi === 'tolak' ? 'REJECTED' : 'RESOLVED'

  await prisma.$transaction(async (tx) => {
    // Hapus konten (soft delete) kalau moderator memilih aksi ini
    if (aksi === 'hapus_konten') {
      if (laporan.targetType === 'THREAD' && laporan.threadId) {
        await tx.thread.update({
          where: { id: laporan.threadId },
          data: { deletedAt: new Date() },
        })
      } else if (laporan.targetType === 'COMMENT' && laporan.commentId) {
        await tx.comment.update({
          where: { id: laporan.commentId },
          data: { deletedAt: new Date() },
        })
      }
    }

    await tx.report.update({
      where: { id: reportId },
      data: {
        status: statusBaru,
        reviewedBy: moderator.id,
        reviewedAt: new Date(),
      },
    })
  })

  // Notifikasi SISTEM ke pelapor: hasil laporannya
  await createNotification({
    userId: laporan.reporterId,
    type: 'SYSTEM',
    message:
      aksi === 'tolak'
        ? 'Laporan kamu telah ditinjau dan tidak ditemukan pelanggaran.'
        : 'Laporan kamu telah ditinjau dan konten yang dilaporkan sudah ditindak.',
  })

  // Notifikasi SISTEM ke pemilik konten kalau kontennya dihapus
  if (aksi === 'hapus_konten') {
    const pemilikId = laporan.thread?.userId ?? laporan.comment?.userId
    if (pemilikId) {
      await createNotification({
        userId: pemilikId,
        type: 'SYSTEM',
        message: 'Salah satu konten kamu dihapus moderator karena melanggar aturan forum.',
      })
    }
  }

  revalidatePath('/moderasi')
}
