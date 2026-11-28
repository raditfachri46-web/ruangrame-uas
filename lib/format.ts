// Helper untuk format tampilan (tanggal, waktu relatif, cuplikan teks, avatar)

const ZONA_WAKTU = 'Asia/Jakarta'

export function formatTanggal(tanggal: Date): string {
  return tanggal.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: ZONA_WAKTU,
  })
}

export function formatTanggalJam(tanggal: Date): string {
  const teks = tanggal.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: ZONA_WAKTU,
  })
  return `${teks} WIB`
}

// Panggil di server component SETELAH query DB selesai (aturan Next cacheComponents)
export function waktuRelatif(tanggal: Date, sekarang: number = Date.now()): string {
  const detik = Math.floor((sekarang - tanggal.getTime()) / 1000)
  if (detik < 60) return 'baru saja'
  const menit = Math.floor(detik / 60)
  if (menit < 60) return `${menit} menit lalu`
  const jam = Math.floor(menit / 60)
  if (jam < 24) return `${jam} jam lalu`
  const hari = Math.floor(jam / 24)
  if (hari < 7) return `${hari} hari lalu`
  if (hari < 30) return `${Math.floor(hari / 7)} minggu lalu`
  if (hari < 365) return `${Math.floor(hari / 30)} bulan lalu`
  return `${Math.floor(hari / 365)} tahun lalu`
}

// Estimasi waktu baca (rata-rata 200 kata per menit)
export function estimasiBaca(teks: string): number {
  const jumlahKata = teks.trim().split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(jumlahKata / 200))
}

export function inisial(nama: string): string {
  return (nama.trim().charAt(0) || '?').toUpperCase()
}

const WARNA_AVATAR = [
  'bg-cobalt text-white',
  'bg-coral text-white',
  'bg-sun text-ink',
  'bg-mint text-ink',
  'bg-ink text-white',
]

function hash(teks: string): number {
  let h = 0
  for (const huruf of teks) h = (h * 31 + huruf.charCodeAt(0)) >>> 0
  return h
}

// Warna avatar konsisten untuk nama yang sama
export function warnaAvatar(nama: string): string {
  return WARNA_AVATAR[hash(nama) % WARNA_AVATAR.length]
}

const WARNA_KATEGORI = [
  { blok: 'bg-cobalt text-white', sub: 'text-white/75', bar: 'bg-cobalt', chip: 'bg-cobalt/10 text-cobalt border-cobalt/40', titik: 'bg-cobalt' },
  { blok: 'bg-coral text-ink', sub: 'text-ink/70', bar: 'bg-coral', chip: 'bg-coral/15 text-[#b8321f] border-coral/50', titik: 'bg-coral' },
  { blok: 'bg-sun text-ink', sub: 'text-ink/70', bar: 'bg-sun', chip: 'bg-sun/40 text-ink border-sun', titik: 'bg-sun' },
  { blok: 'bg-mint text-ink', sub: 'text-ink/70', bar: 'bg-mint', chip: 'bg-mint/20 text-[#0b6b4f] border-mint/60', titik: 'bg-mint' },
]

// Warna kategori konsisten berdasarkan nama, dipakai di bar, chip, dan titik
export function warnaKategori(nama: string | null | undefined) {
  return WARNA_KATEGORI[hash(nama ?? 'Umum') % WARNA_KATEGORI.length]
}

// Ambil potongan teks di sekitar kata kunci pertama yang cocok
export function ambilCuplikan(teks: string, kataKunci = '', panjang = 180): string {
  const bersih = teks.replace(/\s+/g, ' ').trim()
  if (bersih.length <= panjang) return bersih

  const daftarKata = kataKunci.toLowerCase().split(' ').filter(Boolean)
  const kecil = bersih.toLowerCase()
  let posisi = -1
  for (const kata of daftarKata) {
    const i = kecil.indexOf(kata)
    if (i !== -1 && (posisi === -1 || i < posisi)) posisi = i
  }

  if (posisi === -1) return bersih.slice(0, panjang).trimEnd() + '…'

  const mulai = Math.max(0, posisi - 60)
  const akhir = Math.min(bersih.length, mulai + panjang)
  return (
    (mulai > 0 ? '…' : '') +
    bersih.slice(mulai, akhir).trim() +
    (akhir < bersih.length ? '…' : '')
  )
}