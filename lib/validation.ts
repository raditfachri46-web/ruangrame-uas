// Aturan validasi thread. Dipakai di client (live) DAN di server action (wajib).

export const BATAS = {
  judulMin: 5,
  judulMax: 120,
  kontenMin: 20,
  kontenMax: 5000,
  penulisMin: 2,
  penulisMax: 40,
} as const

export type FieldThread = 'judul' | 'konten' | 'penulis' | 'kategoriId'
export type ThreadErrors = Partial<Record<FieldThread | 'form', string>>

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
