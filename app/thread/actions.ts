'use server'

import { prisma } from '@/lib/prisma'

export async function tambahView(threadId: number): Promise<void> {
  if (!Number.isInteger(threadId) || threadId < 1 || threadId > 2147483647) return
  try {
    await prisma.thread.update({
      where: { id: threadId },
      data: { views: { increment: 1 } },
    })
  } catch {
    // thread tidak ada / DB bermasalah: abaikan, tidak penting untuk pembaca
  }
}