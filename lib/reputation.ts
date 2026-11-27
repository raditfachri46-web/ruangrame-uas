import { prisma } from '@/lib/prisma'

export type PeringkatUser = {
  id: number
  username: string
  totalCendol: number
  jumlahThread: number
  jumlahKomentar: number
  skor: number
}

// Formula sederhana: cendol dihitung 2x lipat, tiap thread 3 poin, tiap komentar 1 poin.
// Konten yang sudah di-soft-delete (deletedAt terisi) tidak ikut dihitung.
const BOBOT_CENDOL = 2
const BOBOT_THREAD = 3
const BOBOT_KOMENTAR = 1

export async function ambilPeringkat(): Promise<PeringkatUser[]> {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      threads: {
        where: { deletedAt: null },
        select: { votes: { select: { value: true } } },
      },
      comments: {
        where: { deletedAt: null },
        select: { id: true },
      },
    },
  })

  const peringkat: PeringkatUser[] = users.map((u) => {
    const totalCendol = u.threads.reduce(
      (sum, t) => sum + t.votes.reduce((s, v) => s + v.value, 0),
      0
    )
    const jumlahThread = u.threads.length
    const jumlahKomentar = u.comments.length
    const skor = totalCendol * BOBOT_CENDOL + jumlahThread * BOBOT_THREAD + jumlahKomentar * BOBOT_KOMENTAR

    return { id: u.id, username: u.username, totalCendol, jumlahThread, jumlahKomentar, skor }
  })

  return peringkat.sort((a, b) => b.skor - a.skor)
}
