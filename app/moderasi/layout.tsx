import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, isModerator } from '@/lib/session'


export const instant = false

export default async function ModerasiLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')
  if (!isModerator(user)) redirect('/')

  return <>{children}</>
}
