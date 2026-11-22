'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { validasiThread, type FormState, type ThreadInput } from '@/lib/validation'

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
  if (!data) return { errors, values }

  let threadId: number
  try {
    const kategori = await prisma.kategori.findUnique({ where: { id: data.kategoriId } })
    if (!kategori) {
      return { errors: { kategoriId: 'Kategori tidak ditemukan.' }, values }
    }

    const thread = await prisma.thread.create({
      data: {
        judul: data.judul,
        konten: data.konten,
        penulis: data.penulis,
        kategoriId: data.kategoriId,
      },
    })
    threadId = thread.id
  } catch {
    return {
      errors: { form: 'Gagal menyimpan diskusi. Cek koneksi lalu coba lagi.' },
      values,
    }
  }

  revalidatePath('/')
  revalidatePath('/search')
  redirect(`/thread/${threadId}`) // redirect harus di luar try/catch
}
