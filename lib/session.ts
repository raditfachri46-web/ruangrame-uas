import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'

export type CurrentUser = {
  id: number
  username: string
  role: 'USER' | 'MODERATOR' | 'ADMIN'
}

// Baca cookie 'ruangrame_user' lalu ambil id + role dari DB.
// Dipakai di semua fitur yang butuh identitas user (notifikasi, leaderboard, moderasi).
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const cookieStore = await cookies()
  const username = cookieStore.get('ruangrame_user')?.value
  if (!username) return null

  const user = await prisma.user.findUnique({
    where: { username },
    select: { id: true, username: true, role: true },
  })

  return user
}

export function isModerator(user: CurrentUser | null): boolean {
  return user?.role === 'MODERATOR' || user?.role === 'ADMIN'
}
