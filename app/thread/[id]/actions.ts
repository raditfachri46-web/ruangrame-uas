'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { createNotification } from '@/lib/notifications'
import { notifyMentions } from '@/lib/mentions'

export type KomentarState = {
  error?: string
}

export async function kirimKomentar(
  _prevState: KomentarState,
  formData: FormData
): Promise<KomentarState> {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const threadId = Number(formData.get('threadId'))
  const content = String(formData.get('content') || '').trim()

  if (!content) return { error: 'Komentar tidak boleh kosong.' }
  if (content.length > 2000) return { error: 'Komentar maksimal 2000 karakter.' }

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { id: true, userId: true, judul: true },
  })
  if (!thread || !thread.id) return { error: 'Thread tidak ditemukan.' }

  const komentar = await prisma.comment.create({
    data: { content, threadId, userId: user.id },
  })

  const link = `/thread/${threadId}#komentar-${komentar.id}`

  // Notifikasi REPLY ke pemilik thread (kalau bukan diri sendiri & thread punya pemilik terdaftar)
  if (thread.userId) {
    await createNotification({
      userId: thread.userId,
      actorId: user.id,
      type: 'REPLY',
      message: `@${user.username} membalas thread "${thread.judul}" milikmu.`,
      link,
    })
  }

  // Notifikasi MENTION ke user yang disebut lewat @username di komentar
  await notifyMentions(content, user.id, link)

  revalidatePath(`/thread/${threadId}`)
  return {}
}

export async function toggleVote(threadId: number) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const thread = await prisma.thread.findUnique({
    where: { id: threadId },
    select: { userId: true, judul: true },
  })
  if (!thread) return

  const voteAda = await prisma.vote.findUnique({
    where: { userId_threadId: { userId: user.id, threadId } },
  })

  if (voteAda) {
    // Sudah pernah vote -> klik lagi berarti batal (cabut cendol)
    await prisma.vote.delete({ where: { id: voteAda.id } })
  } else {
    await prisma.vote.create({
      data: { userId: user.id, threadId, value: 1 },
    })

    if (thread.userId) {
      await createNotification({
        userId: thread.userId,
        actorId: user.id,
        type: 'VOTE',
        message: `@${user.username} memberi cendol pada thread "${thread.judul}" milikmu.`,
        link: `/thread/${threadId}`,
      })
    }
  }

  revalidatePath(`/thread/${threadId}`)
}
