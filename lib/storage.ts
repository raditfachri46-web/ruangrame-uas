import { randomUUID } from 'node:crypto'

// Upload gambar ke Supabase Storage lewat REST API (tanpa paket tambahan).
// Hanya dipakai di server (server action). Kunci rahasia TIDAK boleh sampai ke browser.
const BUCKET = 'thread-images'

function konfigurasi() {
  const url = process.env.SUPABASE_URL?.replace(/\/$/, '')
  const kunci = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !kunci) return null
  return { url, kunci }
}

// Kunci baru (sb_secret_...) bukan JWT: cukup dikirim lewat header apikey
function headerAuth(kunci: string): Record<string, string> {
  return kunci.startsWith('eyJ')
    ? { Authorization: `Bearer ${kunci}`, apikey: kunci }
    : { apikey: kunci }
}

// Cek isi file yang sebenarnya (bukan cuma ekstensi / tipe dari browser)
function deteksiTipe(b: Uint8Array): { mime: string; ext: string } | null {
  const sama = (awal: number[], offset = 0) => awal.every((nilai, i) => b[offset + i] === nilai)
  if (sama([0xff, 0xd8, 0xff])) return { mime: 'image/jpeg', ext: 'jpg' }
  if (sama([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return { mime: 'image/png', ext: 'png' }
  if (sama([0x47, 0x49, 0x46, 0x38])) return { mime: 'image/gif', ext: 'gif' }
  if (sama([0x52, 0x49, 0x46, 0x46]) && sama([0x57, 0x45, 0x42, 0x50], 8)) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}

export type HasilUnggah =
  | { ok: true; url: string; path: string }
  | { ok: false; error: string }

export async function unggahGambar(file: File): Promise<HasilUnggah> {
  const cfg = konfigurasi()
  if (!cfg) return { ok: false, error: 'Fitur unggah gambar belum dikonfigurasi di server.' }

  const isi = new Uint8Array(await file.arrayBuffer())
  const tipe = deteksiTipe(isi)
  if (!tipe) return { ok: false, error: 'File bukan gambar JPG, PNG, WebP, atau GIF yang valid.' }

  // Nama file dibuat acak, nama asli dari pengguna tidak dipakai
  const path = `${new Date().getFullYear()}/${randomUUID()}.${tipe.ext}`

  try {
    const res = await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'POST',
      headers: {
        ...headerAuth(cfg.kunci),
        'Content-Type': tipe.mime,
        'Cache-Control': 'max-age=31536000',
        'x-upsert': 'false',
      },
      body: isi,
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) {
      return { ok: false, error: 'Gagal mengunggah gambar. Coba lagi beberapa saat.' }
    }
  } catch {
    return { ok: false, error: 'Gagal terhubung ke penyimpanan gambar. Coba lagi.' }
  }

  return { ok: true, url: `${cfg.url}/storage/v1/object/public/${BUCKET}/${path}`, path }
}

// Dipakai untuk membersihkan file kalau penyimpanan thread ke database gagal
export async function hapusGambar(path: string): Promise<void> {
  const cfg = konfigurasi()
  if (!cfg) return
  try {
    await fetch(`${cfg.url}/storage/v1/object/${BUCKET}/${path}`, {
      method: 'DELETE',
      headers: headerAuth(cfg.kunci),
      signal: AbortSignal.timeout(10000),
    })
  } catch {
    // abaikan, file yatim tidak berbahaya
  }
}