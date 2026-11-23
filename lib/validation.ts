// Aturan validasi thread. Dipakai di client (live) DAN di server action (wajib).

export const BATAS = {
  judulMin: 5,
  judulMax: 120,
  kontenMin: 20,
  kontenMax: 5000,
  penulisMin: 2,
  penulisMax: 40,
  gambarMaxBytes: 3 * 1024 * 1024, // 3 MB
} as const

export const TIPE_GAMBAR = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export type FieldThread = 'judul' | 'konten' | 'penulis' | 'kategoriId'
export type ThreadErrors = Partial<Record<FieldThread | 'form' | 'gambar', string>>

export type ThreadInput = {
  judul: string
  konten: string
  penulis: string
  kategoriId: string
}

export type ThreadValid = {
  judul: string
  konten: string
  penulis: string
  kategoriId: number
}

export type FormState = {
  errors: ThreadErrors
  values: ThreadInput
}

export function validasiThread(input: ThreadInput): {
  errors: ThreadErrors
  data: ThreadValid | null
} {
  const judul = input.judul.trim().replace(/\s+/g, ' ')
  const konten = input.konten.replace(/\r\n/g, '\n').trim()
  const penulis = input.penulis.trim().replace(/\s+/g, ' ')
  const kategoriId = Number(input.kategoriId)
  const errors: ThreadErrors = {}

  if (!input.kategoriId || !Number.isInteger(kategoriId) || kategoriId < 1) {
    errors.kategoriId = 'Pilih salah satu kategori dulu ya.'
  }

  if (judul.length < BATAS.judulMin) {
    errors.judul = `Judul minimal ${BATAS.judulMin} karakter.`
  } else if (judul.length > BATAS.judulMax) {
    errors.judul = `Judul maksimal ${BATAS.judulMax} karakter.`
  }

  if (konten.length < BATAS.kontenMin) {
    errors.konten = `Isi diskusi minimal ${BATAS.kontenMin} karakter biar jelas.`
  } else if (konten.length > BATAS.kontenMax) {
    errors.konten = `Isi diskusi maksimal ${BATAS.kontenMax} karakter.`
  }

  if (penulis.length < BATAS.penulisMin) {
    errors.penulis = `Nama minimal ${BATAS.penulisMin} karakter.`
  } else if (penulis.length > BATAS.penulisMax) {
    errors.penulis = `Nama maksimal ${BATAS.penulisMax} karakter.`
  }

  if (Object.keys(errors).length > 0) return { errors, data: null }
  return { errors: {}, data: { judul, konten, penulis, kategoriId } }
}

// Validasi file gambar. Dipakai di browser (cepat) dan di server action (wajib).
// Pengecekan isi file yang sebenarnya (magic bytes) ada di lib/storage.ts.
export function validasiFileGambar(file: File | null | undefined): string | null {
  if (!file || file.size === 0) return null // gambar bersifat opsional
  if (!(TIPE_GAMBAR as readonly string[]).includes(file.type)) {
    return 'Gambar harus berformat JPG, PNG, WebP, atau GIF.'
  }
  if (file.size > BATAS.gambarMaxBytes) {
    const mb = BATAS.gambarMaxBytes / (1024 * 1024)
    return `Ukuran gambar maksimal ${mb} MB.`
  }
  return null
}