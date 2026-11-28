import Link from 'next/link'
import { PageShell } from '@/components/PageShell'
import { InfoHero, InfoCard, InfoCta } from '@/components/InfoPage'

export const metadata = {
  title: 'Tentang',
  description: 'Kenalan dengan RuangRame, forum diskusi kampus untuk mahasiswa.',
}

const fitur = [
  {
    ikon: '💬',
    judul: 'Thread Diskusi',
    teks: 'Buat topik baru untuk tanya tugas, bahas materi, atau bagikan info. Bisa ditambah gambar pendukung.',
  },
  {
    ikon: '📂',
    judul: 'Kategori & Sub-forum',
    teks: 'Setiap thread masuk ke kategori tertentu supaya diskusi lebih rapi dan gampang dicari.',
  },
  {
    ikon: '🏷️',
    judul: 'Tag & Trending',
    teks: 'Tulis #hashtag di judul atau isi thread. Tag yang sering dipakai muncul di Tag Populer dan Trending.',
  },
  {
    ikon: '🌱',
    judul: 'Cendol',
    teks: 'Beri cendol untuk thread yang membantu. Cendol jadi tanda apresiasi dari sesama anggota.',
  },
  {
    ikon: '🏆',
    judul: 'Leaderboard',
    teks: 'Anggota paling aktif dan paling banyak dapat cendol tampil di papan peringkat reputasi.',
  },
  {
    ikon: '🔔',
    judul: 'Notifikasi & Mention',
    teks: 'Dapat kabar saat thread-mu dibalas, diberi cendol, atau saat kamu di-mention lewat @username.',
  },
  {
    ikon: '🔍',
    judul: 'Pencarian',
    teks: 'Cari diskusi lama berdasarkan kata kunci sebelum membuat thread baru, siapa tahu sudah pernah dibahas.',
  },
  {
    ikon: '🛡️',
    judul: 'Moderasi',
    teks: 'Konten yang melanggar bisa dilaporkan, lalu ditinjau oleh moderator dan admin forum.',
  },
]

export default function TentangPage() {
  return (
    <PageShell>
      <div className="space-y-8">
        <InfoHero
          aktif="/tentang"
          badge="✨ Tentang Forum"
          judul="Tentang RuangRame"
          deskripsi="RuangRame adalah forum diskusi kampus tempat mahasiswa ngobrol santai, bertanya tugas, membahas mata kuliah, dan berbagi info penting seputar kampus."
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <InfoCard className="lg:col-span-2">
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              🎯 Kenapa RuangRame?
            </h2>
            <div className="space-y-3 text-sm text-slate-300 leading-relaxed">
              <p>
                Info kampus sering tercecer di banyak grup chat dan cepat tenggelam. RuangRame hadir
                sebagai satu tempat diskusi yang tersusun per kategori, bisa dicari kapan saja, dan
                terbuka untuk semua mahasiswa.
              </p>
              <p>
                Di sini kamu bisa bertanya tanpa sungkan, membantu teman yang sedang kesulitan, dan
                membangun reputasi lewat kontribusi yang bermanfaat.
              </p>
            </div>
          </InfoCard>

          <InfoCard>
            <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              🤝 Nilai Kami
            </h2>
            <ul className="space-y-2.5 text-sm text-slate-300">
              <li className="flex gap-2">
                <span className="text-fuchsia-300">-</span> Saling menghargai
              </li>
              <li className="flex gap-2">
                <span className="text-fuchsia-300">-</span> Berbagi ilmu dengan jujur
              </li>
              <li className="flex gap-2">
                <span className="text-fuchsia-300">-</span> Diskusi yang sehat dan relevan
              </li>
              <li className="flex gap-2">
                <span className="text-fuchsia-300">-</span> Ruang aman untuk semua
              </li>
            </ul>
          </InfoCard>
        </div>

        <div>
          <h2 className="text-lg font-bold tracking-tight text-white mb-4 px-1">🚀 Fitur Forum</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {fitur.map((f) => (
              <div
                key={f.judul}
                className="rounded-3xl bg-white/[0.03] border border-white/[0.09] p-5 hover:border-violet-400/30 hover:bg-violet-500/[0.06] transition-all"
              >
                <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/25 flex items-center justify-center text-xl mb-3">
                  {f.ikon}
                </div>
                <h3 className="font-semibold text-white text-sm mb-1.5">{f.judul}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.teks}</p>
              </div>
            ))}
          </div>
        </div>

        <InfoCard>
          <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
            📈 Cara Kerja Reputasi
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-4">
            Skor di{' '}
            <Link href="/leaderboard" className="text-violet-300 hover:text-fuchsia-300 font-semibold">
              Leaderboard
            </Link>{' '}
            dihitung dari kontribusimu di forum. Konten yang sudah dihapus moderator tidak ikut
            dihitung.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-center">
              <p className="text-2xl font-black text-fuchsia-300">2 poin</p>
              <p className="text-xs text-slate-400 mt-1">setiap cendol yang diterima</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-center">
              <p className="text-2xl font-black text-fuchsia-300">3 poin</p>
              <p className="text-xs text-slate-400 mt-1">setiap thread yang dibuat</p>
            </div>
            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.08] p-4 text-center">
              <p className="text-2xl font-black text-fuchsia-300">1 poin</p>
              <p className="text-xs text-slate-400 mt-1">setiap komentar yang ditulis</p>
            </div>
          </div>
        </InfoCard>

        <InfoCta
          judul="Siap ikut meramaikan?"
          teks="Mulai diskusi pertamamu atau jelajahi kategori yang ada."
        />
      </div>
    </PageShell>
  )
}
