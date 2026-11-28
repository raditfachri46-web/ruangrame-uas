import { Suspense, type ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { getCurrentUser, isModerator } from '@/lib/session'

async function PenjagaModerator({ children }: { children: ReactNode }) {
  const user = await getCurrentUser()

  if (!user) redirect('/login')
  if (!isModerator(user)) redirect('/')

  return <>{children}</>
}

export default function ModerasiLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center text-sm font-semibold text-ink/65">
          Memeriksa akses...
        </div>
      }
    >
      <PenjagaModerator>{children}</PenjagaModerator>
    </Suspense>
  )
}