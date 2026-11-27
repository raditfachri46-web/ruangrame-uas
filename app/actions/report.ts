'use server'

import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export type LaporanState = {
  error?: string
  sukses?: boolean
}

export async function buatLaporan(
  _prevState: LaporanState,
  formData: FormData
): Promise<LaporanState> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const targetType = String(formData.get('targetType')) as 'THREAD' | 'COMMENT'
  const threadId = formData.get('threadId') ? Number(formData.get('threadId')) : null
  const commentId = formData.get('commentId') ? Number(formData.get('commentId')) : null
  const reason = String(formData.get('reason') || '').trim()
  const description = String(formData.get('description') || '').trim()

  if (targetType !== 'THREAD' && targetType !== 'COMMENT') {
    return { error: 'Jenis konten tidak valid.' }
  }
  if (!reason) return { error: 'Pilih alasan laporan.' }
  if ((targetType === 'THREAD' && !threadId) || (targetType === 'COMMENT' && !commentId)) {
    return { error: 'Konten yang dilaporkan tidak ditemukan.' }
  }

  await prisma.report.create({
    data: {
      reporterId: user.id,
      targetType,
      threadId: targetType === 'THREAD' ? threadId : null,
      commentId: targetType === 'COMMENT' ? commentId : null,
      reason,
      description: description || null,
    },
  })

  return { sukses: true }
}
