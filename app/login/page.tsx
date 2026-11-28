import { PageShell } from '@/components/PageShell'
import { AuthForm } from '@/components/AuthForm'

export const metadata = { title: 'Masuk' }

export default function LoginPage() {
  return (
    <PageShell aktif="masuk">
      <AuthForm mode="masuk" />
    </PageShell>
  )
}
