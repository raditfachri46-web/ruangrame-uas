import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { InfoHero, InfoCard, InfoCta } from '@/components/InfoPage'

export const metadata = {
  title: 'Peraturan Forum',
  description: 'Peraturan dan etika berdiskusi di forum RuangRame.',
}

const peraturan = [
  {
    judul: 'Saling menghormati',
    poin: [
      'Gunakan bahasa yang sopan kepada semua anggota.',
      'Dilarang menghina, merendahkan, atau menyerang pribadi orang lain.',
      'Kritik boleh, asalkan ditujukan pada ide, bukan orangnya.',
    ],
  },
  {
    judul: 'Tanpa ujaran kebencian dan pelecehan',
    poin: [
      'Dilarang konten yang menyinggung SARA atau memicu permusuhan.',
      'Dilarang melecehkan, mengancam, atau merundung anggota lain.',
    ],
  },
  {
    judul: 'Bukan tempat spam',
    poin: [
      'Dilarang iklan, promosi berlebihan, atau tautan yang tidak relevan.',
      'Jangan membuat thread atau komentar yang sama berulang kali.',
      'Cari dulu sebelum membuat thread baru, siapa tahu topiknya sudah pernah dibahas.',
    ],
  },
  {
    judul: 'Konten pantas',
    poin: [
      'Dilarang konten dewasa, kekerasan, atau gambar yang tidak pantas.',
      'Gambar yang diunggah harus relevan dengan isi diskusi.',
    ],
  },
  {
    judul: 'Sesuai kategori dan jelas',
    poin: [
      'Pilih kategori yang paling cocok dengan topik thread.',
      'Tulis judul yang menggambarkan isi, hindari judul seperti "tolong" atau "help".',
      'Gunakan tag (#) secukupnya dan sesuai topik.',
    ],
  },
  {
    judul: 'Jaga kejujuran akademik',
    poin: [
      'Bertanya dan berdiskusi soal tugas sangat dianjurkan.',
      'Dilarang menawarkan jasa joki atau membagikan kunci jawaban ujian yang sedang berlangsung.',
      'Cantumkan sumber jika mengutip materi milik orang lain.',
    ],
  },
  {
    judul: 'Hormati privasi',
    poin: [
      'Dilarang menyebarkan data pribadi orang lain seperti nomor HP, alamat, atau foto tanpa izin.',
      'Jangan membagikan password akunmu kepada siapa pun.',
    ],
  },
  {
    judul: 'Laporkan, jangan main hakim sendiri',
    poin: [
      'Jika menemukan pelanggaran, gunakan tombol laporkan pada thread atau komentar.',
      'Hindari membalas provokasi, biarkan moderator yang menindaklanjuti.',
    ],
  },
]

export default function PeraturanPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <InfoHero
          aktif="/peraturan"
          badge="📜 Etika Berdiskusi"
          judul="Peraturan Forum"
          deskripsi="Supaya RuangRame tetap nyaman untuk semua, setiap anggota wajib mengikuti peraturan berikut saat membuat thread maupun berkomentar."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {peraturan.map((p, i) => (
            <div
              key={p.judul}
              className="rounded-3xl bg-white/[0.03] border border-white/[0.09] p-6 hover:border-violet-400/30 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="w-9 h-9 shrink-0 rounded-2xl bg-gradient-to-tr from-violet-600/40 to-fuchsia-500/30 border border-violet-400/30 flex items-center justify-center text-sm font-black text-white">
                  {i + 1}
                </span>
                <h2 className="font-bold text-white">{p.judul}</h2>
              </div>
              <ul className="space-y-2">
                {p.poin.map((poin) => (
                  <li key={poin} className="flex gap-2 text-sm text-slate-300 leading-relaxed">
                    <span className="text-fuchsia-300 shrink-0">-</span>
                    <span>{poin}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <InfoCard className="border-rose-400/20">
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            ⚠️ Sanksi Pelanggaran
          </h2>
          <ul className="space-y-2.5 text-sm text-slate-300 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-rose-300 shrink-0">-</span>
              <span>
                Konten yang terbukti melanggar akan disembunyikan oleh moderator atau admin dan tidak
                lagi dihitung di leaderboard.
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-rose-300 shrink-0">-</span>
              <span>Pemilik konten akan menerima notifikasi dari sistem.</span>
            </li>
            <li className="flex gap-2">
              <span className="text-rose-300 shrink-0">-</span>
              <span>Pelanggaran berulang dapat ditindak lebih lanjut oleh admin forum.</span>
            </li>
          </ul>
          <p className="mt-4 text-xs text-slate-500">
            Dengan menggunakan RuangRame, kamu dianggap telah membaca dan menyetujui peraturan ini.
            Ada pertanyaan? Cek{' '}
            <Link href="/faq" className="text-violet-300 hover:text-fuchsia-300 font-semibold">
              FAQ
            </Link>
            .
          </p>
        </InfoCard>

        <InfoCta
          judul="Sudah paham peraturannya?"
          teks="Yuk mulai berdiskusi dengan nyaman dan saling menghargai."
        />
      </div>
    </PageShell>
  )
}
