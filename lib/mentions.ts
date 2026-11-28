import { prisma } from '@/lib/prisma'
import { createNotification } from '@/lib/notifications'

// Cari semua @username di isi komentar, lalu kirim notifikasi MENTION
// ke tiap user yang username-nya cocok dan benar-benar terdaftar.
export async function notifyMentions(content: string, actorId: number, link?: string) {
  const usernames = [...content.matchAll(/@(\w+)/g)].map((m) => m[1])
  if (usernames.length === 0) return

  const uniqueUsernames = [...new Set(usernames)]
  const mentionedUsers = await prisma.user.findMany({
    where: { username: { in: uniqueUsernames } },
    select: { id: true },
  })

  for (const u of mentionedUsers) {
    await createNotification({
      userId: u.id,
      actorId,
      type: 'MENTION',
      message: 'Seseorang menyebut kamu dalam komentar.',
      link,
    })
  }
}
