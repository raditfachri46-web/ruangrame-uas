'use server'

import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function tandaiDibaca(id: number) {
  const user = await getCurrentUser()
  if (!user) return

  // where menyertakan userId supaya orang lain tidak bisa menandai notifikasi orang lain
  await prisma.notification.updateMany({
    where: { id, userId: user.id },
    data: { isRead: true },
  })

  revalidatePath('/notifikasi')
}

export async function tandaiSemuaDibaca() {
  const user = await getCurrentUser()
  if (!user) return

  await prisma.notification.updateMany({
    where: { userId: user.id, isRead: false },
    data: { isRead: true },
  })

  revalidatePath('/notifikasi')
}
