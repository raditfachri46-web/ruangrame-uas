import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { EmptyState } from '@/components/ui'

export default function ThreadNotFound() {
  return (
    <PageShell>
      <div className="max-w-2xl">
        <EmptyState
          judul="Thread tidak ditemukan"
          deskripsi="Link thread ini salah atau thread sudah dihapus."
          aksi={
            <>
              <Link href="/" className="btn-utama">
                Ke beranda
              </Link>
              <Link href="/search" className="btn-tenang">
                Cari thread
              </Link>
            </>
          }
        />
      </div>
    </PageShell>
  )
}
