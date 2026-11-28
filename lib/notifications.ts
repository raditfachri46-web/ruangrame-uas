import { prisma } from '@/lib/prisma'
import type { NotificationType } from '@prisma/client'

type CreateNotificationInput = {
  userId: number // penerima
  actorId?: number | null // pemicu (yang reply/vote/mention), null untuk SYSTEM
  type: NotificationType
  message: string
  link?: string | null
}

// Dipanggil dari: action buat komentar (REPLY), action vote (VOTE),
// lib/mentions.ts (MENTION), dan app/moderasi/actions.ts (SYSTEM).
export async function createNotification(input: CreateNotificationInput) {
  // Jangan kirim notifikasi ke diri sendiri (mis. vote/reply di thread sendiri)
  if (input.actorId && input.actorId === input.userId) return null

  return prisma.notification.create({
    data: {
      userId: input.userId,
      actorId: input.actorId ?? null,
      type: input.type,
      message: input.message,
      link: input.link ?? null,
    },
  })
}
