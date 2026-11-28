import { PageShell } from '@/components/PageShell'
import { AuthForm } from '@/components/AuthForm'

export const metadata = { title: 'Daftar' }

export default function RegisterPage() {
  return (
    <PageShell>
      <AuthForm mode="daftar" />
    </PageShell>
  )
}
