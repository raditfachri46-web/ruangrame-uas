'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { hapusGambar, unggahGambar } from '@/lib/storage'
import {
  validasiFileGambar,
  validasiThread,
  type FormState,
  type ThreadInput,
} from '@/lib/validation'

function ambilTeks(formData: FormData, nama: string): string {
  const nilai = formData.get(nama)
  return typeof nilai === 'string' ? nilai : ''
}

export async function buatThread(_stateLama: FormState, formData: FormData): Promise<FormState> {
  const values: ThreadInput = {
    judul: ambilTeks(formData, 'judul'),
    konten: ambilTeks(formData, 'konten'),
    penulis: ambilTeks(formData, 'penulis'),
    kategoriId: ambilTeks(formData, 'kategoriId'),
  }

  // Honeypot: kolom tersembunyi yang tidak diisi manusia. Kalau terisi = bot.
  if (ambilTeks(formData, 'website') !== '') redirect('/')

  // Validasi ulang di server (validasi client bisa dilewati)
  const { errors, data } = validasiThread(values)

  // Gambar bersifat opsional. Input file kosong tetap terkirim sebagai File berukuran 0.
  const berkas = formData.get('gambar')
  const file = berkas instanceof File && berkas.size > 0 ? berkas : null
  const errorGambar = validasiFileGambar(file)
  if (errorGambar) errors.gambar = errorGambar

  if (!data || errors.gambar) return { errors, values }

  // Pastikan kategori ada SEBELUM mengunggah gambar, supaya tidak ada file yatim
  try {
    const kategori = await prisma.kategori.findUnique({ where: { id: data.kategoriId } })
    if (!kategori) {
      return { errors: { kategoriId: 'Kategori tidak ditemukan.' }, values }
    }
  } catch {
    return {
      errors: { form: 'Gagal menyimpan diskusi. Cek koneksi lalu coba lagi.' },
      values,
    }
  }

  let gambar: { url: string; path: string } | null = null
  if (file) {
    const hasil = await unggahGambar(file)
    if (!hasil.ok) return { errors: { gambar: hasil.error }, values }
    gambar = { url: hasil.url, path: hasil.path }
  }

  let threadId: number
  try {
    const thread = await prisma.thread.create({
      data: {
        judul: data.judul,
        konten: data.konten,
        penulis: data.penulis,
        kategoriId: data.kategoriId,
        gambarUrl: gambar?.url ?? null,
        gambarPath: gambar?.path ?? null,
      },
    })
    threadId = thread.id
  } catch {
    // Simpan ke database gagal: hapus gambar yang sudah terlanjur diunggah
    if (gambar) await hapusGambar(gambar.path)
    return {
      errors: { form: 'Gagal menyimpan diskusi. Cek koneksi lalu coba lagi.' },
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/search')
  redirect(`/thread/${threadId}`) // redirect harus di luar try/catch
}