import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { InfoHero, InfoCta } from '@/components/InfoPage'
import { BATAS } from '@/lib/validation'

export const metadata = {
  title: 'FAQ',
  description: 'Pertanyaan yang sering ditanyakan seputar forum RuangRame.',
}

type ItemFaq = { tanya: string; jawab: string }

const ukuranGambarMb = BATAS.gambarMaxBytes / (1024 * 1024)

// Angka batas diambil dari lib/validation.ts supaya selalu sama dengan validasi form
const grupFaq: { judul: string; ikon: string; items: ItemFaq[] }[] = [
  {
    judul: 'Umum',
    ikon: '💡',
    items: [
      {
        tanya: 'Apa itu RuangRame?',
        jawab:
          'RuangRame adalah forum diskusi kampus untuk bertanya tugas, membahas mata kuliah, dan berbagi info penting antar mahasiswa.',
      },
      {
        tanya: 'Apakah harus punya akun?',
        jawab:
          'Membaca dan mencari diskusi bisa tanpa akun. Untuk berkomentar, memberi cendol, melaporkan konten, dan menerima notifikasi, kamu perlu daftar lalu login.',
      },
      {
        tanya: 'Bagaimana cara daftar akun?',
        jawab:
          'Klik Login lalu pilih Daftar. Isi username (minimal 3 karakter) dan password. Username harus unik, jadi pilih yang belum dipakai orang lain.',
      },
      {
        tanya: 'Saya lupa password, bagaimana?',
        jawab:
          'Saat ini belum ada fitur reset password otomatis. Simpan password kamu baik-baik, dan hubungi admin forum kalau mengalami kendala akun.',
      },
    ],
  },
  {
    judul: 'Thread & Komentar',
    ikon: '💬',
    items: [
      {
        tanya: 'Bagaimana cara membuat thread?',
        jawab: `Klik tombol "+ Buat Thread" di navbar. Pilih kategori, tulis judul (${BATAS.judulMin}-${BATAS.judulMax} karakter), isi diskusi (${BATAS.kontenMin}-${BATAS.kontenMax} karakter), dan nama penulis (${BATAS.penulisMin}-${BATAS.penulisMax} karakter).`,
      },
      {
        tanya: 'Bisakah menambahkan gambar ke thread?',
        jawab: `Bisa, gambar bersifat opsional. Format yang didukung JPG, PNG, WebP, dan GIF dengan ukuran maksimal ${ukuranGambarMb} MB.`,
      },
      {
        tanya: 'Bagaimana cara memakai tag?',
        jawab:
          'Tulis tanda pagar di judul atau isi thread, misalnya #uts atau #basisdata. Tag yang sering dipakai akan muncul di halaman Tag Populer dan Trending.',
      },
      {
        tanya: 'Apakah ada batas panjang komentar?',
        jawab: 'Ada, satu komentar maksimal 2000 karakter dan tidak boleh kosong.',
      },
      {
        tanya: 'Bagaimana cara menyebut (mention) pengguna lain?',
        jawab:
          'Ketik @ diikuti username, misalnya @budi, di dalam komentar. Pengguna tersebut akan mendapat notifikasi.',
      },
    ],
  },
  {
    judul: 'Cendol, Reputasi & Notifikasi',
    ikon: '🌱',
    items: [
      {
        tanya: 'Apa itu cendol?',
        jawab:
          'Cendol adalah tanda apresiasi untuk thread yang bermanfaat. Satu akun hanya bisa memberi satu cendol per thread, dan klik sekali lagi untuk membatalkannya.',
      },
      {
        tanya: 'Bagaimana skor leaderboard dihitung?',
        jawab:
          'Setiap cendol yang diterima bernilai 2 poin, setiap thread 3 poin, dan setiap komentar 1 poin. Konten yang dihapus moderator tidak dihitung.',
      },
      {
        tanya: 'Kapan saya mendapat notifikasi?',
        jawab:
          'Saat thread-mu dibalas, diberi cendol, saat kamu di-mention, dan saat laporan yang kamu kirim selesai ditinjau moderator.',
      },
    ],
  },
  {
    judul: 'Laporan & Moderasi',
    ikon: '🛡️',
    items: [
      {
        tanya: 'Bagaimana cara melaporkan konten?',
        jawab:
          'Gunakan tombol laporkan pada thread atau komentar, lalu pilih alasannya: spam, ujaran kebencian, konten dewasa, pelecehan, atau lainnya.',
      },
      {
        tanya: 'Apa yang terjadi setelah konten dilaporkan?',
        jawab:
          'Moderator atau admin akan meninjau laporan. Jika terbukti melanggar, konten akan disembunyikan dari forum. Jika tidak, laporan ditolak.',
      },
      {
        tanya: 'Siapa moderator forum?',
        jawab:
          'Moderator dan admin adalah anggota yang diberi wewenang untuk meninjau laporan dan menjaga forum tetap nyaman sesuai peraturan.',
      },
    ],
  },
]

export default function FaqPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <InfoHero
          aktif="/faq"
          badge="❓ Pusat Bantuan"
          judul="Pertanyaan yang Sering Ditanyakan"
          deskripsi="Kumpulan jawaban singkat seputar akun, thread, cendol, dan moderasi di RuangRame."
        />

        <div className="space-y-6">
          {grupFaq.map((grup) => (
            <section key={grup.judul} className="space-y-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-fuchsia-300 flex items-center gap-2 px-1">
                {grup.ikon} {grup.judul}
              </h2>
              <div className="space-y-2">
                {grup.items.map((item) => (
                  <details
                    key={item.tanya}
                    className="group rounded-2xl bg-white/[0.03] border border-white/[0.09] open:border-violet-400/30 open:bg-violet-500/[0.06] transition-all"
                  >
                    <summary className="flex items-center justify-between gap-4 cursor-pointer list-none px-5 py-4 text-sm font-semibold text-white [&::-webkit-details-marker]:hidden">
                      <span>{item.tanya}</span>
                      <span
                        aria-hidden="true"
                        className="shrink-0 w-7 h-7 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-violet-300 transition-transform group-open:rotate-45"
                      >
                        +
                      </span>
                    </summary>
                    <p className="px-5 pb-5 -mt-1 text-sm text-slate-300 leading-relaxed">
                      {item.jawab}
                    </p>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="rounded-3xl bg-white/[0.03] border border-white/[0.09] p-6 text-sm text-slate-300 leading-relaxed">
          Belum menemukan jawabannya? Baca juga{' '}
          <Link href="/peraturan" className="text-violet-300 hover:text-fuchsia-300 font-semibold">
            Peraturan Forum
          </Link>{' '}
          atau tanyakan langsung dengan membuat thread baru.
        </div>

        <InfoCta
          judul="Masih ada yang bikin penasaran?"
          teks="Tanyakan di forum, teman-teman lain siap membantu."
        />
      </div>
    </PageShell>
  )
}
