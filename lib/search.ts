import type { Prisma } from '@prisma/client'

export const PER_HALAMAN = 10

export const URUTAN = {
  terbaru: 'Terbaru',
  terlama: 'Terlama',
  populer: 'Terpopuler',
} as const

export type Urutan = keyof typeof URUTAN

export type ParamPencarian = {
  q: string
  kategori: string
  urut: Urutan
  halaman: number
}

type SearchParamsMentah = Record<string, string | string[] | undefined>

export function parseSearchParams(sp: SearchParamsMentah): ParamPencarian {
  const ambil = (kunci: string): string => {
    const nilai = sp[kunci]
    return (Array.isArray(nilai) ? nilai[0] : nilai) ?? ''
  }

  const q = ambil('q').trim().replace(/\s+/g, ' ').slice(0, 100)
  const kategori = ambil('kategori').trim().slice(0, 60)
  const urutMentah = ambil('urut')
  const urut: Urutan = urutMentah in URUTAN ? (urutMentah as Urutan) : 'terbaru'
  const halaman = Math.min(10000, Math.max(1, parseInt(ambil('hal'), 10) || 1))

  return { q, kategori, urut, halaman }
}

// Tiap kata harus ada di judul / isi / penulis (AND antar kata, OR antar kolom)
export function buatWhere(q: string, kategori: string): Prisma.ThreadWhereInput {
  const kataKunci = q ? q.split(' ').slice(0, 6) : []
  const kondisi: Prisma.ThreadWhereInput[] = kataKunci.map((kata) => ({
    OR: [
      { judul: { contains: kata, mode: 'insensitive' } },
      { konten: { contains: kata, mode: 'insensitive' } },
      { penulis: { contains: kata, mode: 'insensitive' } },
    ],
  }))
  if (kategori) kondisi.push({ kategori: { slug: kategori } })
  return { AND: kondisi }
}

export function buatOrderBy(urut: Urutan): Prisma.ThreadOrderByWithRelationInput[] {
  switch (urut) {
    case 'terlama':
      return [{ createdAt: 'asc' }]
    case 'populer':
      return [{ views: 'desc' }, { createdAt: 'desc' }]
    default:
      return [{ createdAt: 'desc' }]
  }
}

// Bikin URL /search?... (nilai default tidak ikut dimasukkan biar URL rapi)
export function buatUrlSearch(param: Partial<ParamPencarian>): string {
  const url = new URLSearchParams()
  if (param.q) url.set('q', param.q)
  if (param.kategori) url.set('kategori', param.kategori)
  if (param.urut && param.urut !== 'terbaru') url.set('urut', param.urut)
  if (param.halaman && param.halaman > 1) url.set('hal', String(param.halaman))
  const teks = url.toString()
  return teks ? `/search?${teks}` : '/search'
}
