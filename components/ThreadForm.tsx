'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { buatThread } from '@/app/buat-thread/actions'
import { KontenTeks } from '@/components/KontenTeks'
import {
  BATAS,
  validasiFileGambar,
  validasiThread,
  type FieldThread,
  type FormState,
  type ThreadInput,
} from '@/lib/validation'

type Kategori = { id: number; nama: string; slug: string }

const KUNCI_DRAFT = 'rr-draft-thread'
const KUNCI_PENULIS = 'rr-nama-penulis'
const URUTAN_FIELD: FieldThread[] = ['judul', 'kategoriId', 'konten', 'penulis']

const teks = (nilai: unknown): string => (typeof nilai === 'string' ? nilai : '')

const formatUkuran = (bytes: number): string =>
  bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`

function Penghitung({ nilai, maks }: { nilai: number; maks: number }) {
  const hampir = nilai >= maks * 0.9
  return (
    <span className={`text-[11px] tabular-nums ${hampir ? 'text-ink' : 'text-ink/55'}`}>
      {nilai}/{maks}
    </span>
  )
}

function PesanError({ id, pesan }: { id: string; pesan?: string }) {
  if (!pesan) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-coral">
      {pesan}
    </p>
  )
}

export function ThreadForm({
  kategori,
  judulAwal = '',
}: {
  kategori: Kategori[]
  judulAwal?: string
}) {
  const awal: FormState = {
    errors: {},
    values: { judul: judulAwal, konten: '', penulis: '', kategoriId: '' },
  }
  const [state, formAction, isPending] = useActionState(buatThread, awal)
  const [values, setValues] = useState<ThreadInput>(awal.values)
  const [tersentuh, setTersentuh] = useState<Partial<Record<FieldThread, boolean>>>({})
  const [sudahCobaKirim, setSudahCobaKirim] = useState(false)
  const [mode, setMode] = useState<'tulis' | 'pratinjau'>('tulis')
  const [draftDipulihkan, setDraftDipulihkan] = useState(false)
  const siapSimpan = useRef(false)

  // Gambar (opsional). File tidak bisa disimpan di draf localStorage, jadi dipisah dari `values`.
  const inputGambar = useRef<HTMLInputElement>(null)
  const [gambar, setGambar] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [errorGambarKlien, setErrorGambarKlien] = useState<string | null>(null)
  const [stateGambarDiubah, setStateGambarDiubah] = useState<FormState | null>(null)

  // Buat & bersihkan URL pratinjau gambar
  useEffect(() => {
    if (!gambar) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPreviewUrl(null)
      return
    }
    const url = URL.createObjectURL(gambar)
    setPreviewUrl(url)
    return () => URL.revokeObjectURL(url)
  }, [gambar])

  // React mengosongkan input file setelah form dikirim. Kalau server menolak (ada error),
  // kembalikan file yang tadi dipilih supaya pengguna tidak perlu memilih ulang.
  useEffect(() => {
    if (!gambar || !inputGambar.current) return
    try {
      const dt = new DataTransfer()
      dt.items.add(gambar)
      inputGambar.current.files = dt.files
    } catch {
      // browser tidak mendukung: pengguna pilih ulang saja
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  // Pulihkan draft & nama penulis dari localStorage (hanya sekali saat halaman dibuka)
  useEffect(() => {
    try {
      const namaTersimpan = teks(localStorage.getItem(KUNCI_PENULIS))
      const mentah = localStorage.getItem(KUNCI_DRAFT)
      const draft = mentah ? (JSON.parse(mentah) as Record<string, unknown>) : null
      const pakaiDraft = !judulAwal && draft !== null
      const kategoriDraft = teks(draft?.kategoriId)
      const kategoriAda = kategori.some((k) => String(k.id) === kategoriDraft)

      // eslint-disable-next-line react-hooks/set-state-in-effect
      setValues({
        judul: judulAwal || (pakaiDraft ? teks(draft?.judul) : ''),
        konten: pakaiDraft ? teks(draft?.konten) : '',
        penulis: (pakaiDraft ? teks(draft?.penulis) : '') || namaTersimpan,
        kategoriId: pakaiDraft && kategoriAda ? kategoriDraft : '',
      })
      if (pakaiDraft && (teks(draft?.judul) || teks(draft?.konten))) setDraftDipulihkan(true)
    } catch {
      // localStorage tidak tersedia / draft rusak: abaikan
    }
    siapSimpan.current = true
  }, [judulAwal, kategori])

  // Simpan draft otomatis (tunggu 0,5 detik setelah berhenti mengetik)
  useEffect(() => {
    if (!siapSimpan.current || isPending) return
    const timer = setTimeout(() => {
      try {
        if (values.judul || values.konten) {
          localStorage.setItem(KUNCI_DRAFT, JSON.stringify(values))
        } else {
          localStorage.removeItem(KUNCI_DRAFT)
        }
      } catch {
        // abaikan
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [values, isPending])

  const errorKlien = validasiThread(values).errors

  function pesan(field: FieldThread): string | undefined {
    if ((tersentuh[field] || sudahCobaKirim) && errorKlien[field]) return errorKlien[field]
    // Error dari server hanya ditampilkan selama isinya belum diubah
    if (state.errors[field] && state.values[field] === values[field]) return state.errors[field]
    return undefined
  }

  const ubah =
    (field: FieldThread) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const nilai = e.target.value
      setValues((v) => ({ ...v, [field]: nilai }))
    }
  const sentuh = (field: FieldThread) => () => setTersentuh((t) => ({ ...t, [field]: true }))

  function saatPilihGambar(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setStateGambarDiubah(state) // sembunyikan error gambar lama dari server
    const masalah = validasiFileGambar(file)
    if (masalah) {
      e.target.value = '' // file bermasalah tidak ikut terkirim
      setGambar(null)
      setErrorGambarKlien(masalah)
      return
    }
    setErrorGambarKlien(null)
    setGambar(file)
  }

  function hapusGambar() {
    if (inputGambar.current) inputGambar.current.value = ''
    setGambar(null)
    setErrorGambarKlien(null)
    setStateGambarDiubah(state)
  }

  const pesanGambar =
    errorGambarKlien ?? (stateGambarDiubah === state ? undefined : state.errors.gambar)

  function saatKirim(e: FormEvent<HTMLFormElement>) {
    setSudahCobaKirim(true)
    if (errorGambarKlien) {
      e.preventDefault()
      inputGambar.current?.focus()
      return
    }
    const bermasalah = URUTAN_FIELD.find((f) => errorKlien[f])
    if (bermasalah) {
      e.preventDefault() // batalkan kirim, fokus ke kolom yang salah
      setMode('tulis')
      document.getElementById(`field-${bermasalah}`)?.focus()
      return
    }
    try {
      localStorage.removeItem(KUNCI_DRAFT)
      localStorage.setItem(KUNCI_PENULIS, values.penulis.trim())
    } catch {
      // abaikan
    }
  }

  function hapusDraft() {
    try {
      localStorage.removeItem(KUNCI_DRAFT)
    } catch {
      // abaikan
    }
    setValues({ judul: '', konten: '', penulis: values.penulis, kategoriId: '' })
    setTersentuh({})
    setDraftDipulihkan(false)
  }

  const kategoriTerpilih = kategori.find((k) => String(k.id) === values.kategoriId)
  const kelasInput = (field: FieldThread) =>
    `w-full rounded-lg bg-white border px-4 py-3 text-sm text-ink placeholder:text-ink/45 outline-none transition-colors focus:bg-white ${
      pesan(field) ? 'border-coral/50 focus:border-coral' : 'border-ink/20 focus:border-cobalt/40'
    }`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form
        action={formAction}
        onSubmit={saatKirim}
        noValidate
        className="lg:col-span-2 space-y-6 border border-ink/20 rounded-xl p-6 sm:p-8 shadow-hard-sm"
      >
        {draftDipulihkan && (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-sun/50 border border-sun px-4 py-3 text-xs text-ink">
            <span>📝 Draf terakhirmu dipulihkan otomatis.</span>
            <button type="button" onClick={hapusDraft} className="font-semibold underline hover:text-cobalt">
              Hapus draf
            </button>
          </div>
        )}

        {state.errors.form && (
          <div role="alert" className="rounded-lg bg-coral/15 border border-coral/50 px-4 py-3 text-sm text-coral">
            {state.errors.form}
          </div>
        )}

        {/* Honeypot anti-bot: jangan diisi */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {/* Kategori */}
        <fieldset aria-describedby="err-kategoriId">
          <legend className="text-sm font-semibold text-ink mb-2">Kategori</legend>
          <div className="flex flex-wrap gap-2">
            {kategori.map((k, i) => (
              <label key={k.id} className="cursor-pointer">
                <input
                  id={i === 0 ? 'field-kategoriId' : undefined}
                  type="radio"
                  name="kategoriId"
                  value={k.id}
                  checked={values.kategoriId === String(k.id)}
                  onChange={ubah('kategoriId')}
                  onBlur={sentuh('kategoriId')}
                  className="peer sr-only"
                />
                <span className="inline-block px-4 py-2 rounded-lg text-sm font-medium border border-ink/20 bg-white text-ink/80 hover:border-cobalt/40 peer-checked:bg-cobalt/10 peer-checked:border-cobalt/40 peer-checked:text-cobalt peer-focus-visible:ring-2 peer-focus-visible:ring-cobalt transition-colors">
                  # {k.nama}
                </span>
              </label>
            ))}
          </div>
          <PesanError id="err-kategoriId" pesan={pesan('kategoriId')} />
        </fieldset>

        {/* Judul */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="field-judul" className="text-sm font-semibold text-ink">
              Judul diskusi
            </label>
            <Penghitung nilai={values.judul.length} maks={BATAS.judulMax} />
          </div>
          <input
            id="field-judul"
            name="judul"
            type="text"
            value={values.judul}
            onChange={ubah('judul')}
            onBlur={sentuh('judul')}
            maxLength={BATAS.judulMax}
            placeholder="Contoh: Ada yang paham materi Basis Data minggu ini?"
            aria-invalid={Boolean(pesan('judul'))}
            aria-describedby="err-judul"
            className={kelasInput('judul')}
          />
          <PesanError id="err-judul" pesan={pesan('judul')} />
        </div>

        {/* Isi */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="field-konten" className="text-sm font-semibold text-ink">
              Isi diskusi
            </label>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-white border border-ink/20 p-0.5 text-xs font-semibold">
                {(['tulis', 'pratinjau'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                      mode === m ? 'bg-cobalt/10 text-ink' : 'text-ink/65 hover:text-cobalt'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Penghitung nilai={values.konten.length} maks={BATAS.kontenMax} />
            </div>
          </div>

          {/* Textarea tetap ada (hidden) saat pratinjau supaya isinya tetap terkirim */}
          <textarea
            id="field-konten"
            name="konten"
            value={values.konten}
            onChange={ubah('konten')}
            onBlur={sentuh('konten')}
            maxLength={BATAS.kontenMax}
            rows={10}
            placeholder="Ceritakan pertanyaan atau topikmu selengkap mungkin. Link (https://...) otomatis bisa diklik."
            aria-invalid={Boolean(pesan('konten'))}
            aria-describedby="err-konten"
            className={`${kelasInput('konten')} resize-y ${mode === 'tulis' ? '' : 'hidden'}`}
          />
          {mode === 'pratinjau' && (
            <div className="rounded-lg bg-ink/5 border border-ink/20 p-5 min-h-[16rem]">
              {values.judul || values.konten ? (
                <>
                  {kategoriTerpilih && (
                    <span className="inline-block px-3 py-1 rounded-xl bg-cobalt/10 text-cobalt text-xs font-semibold border border-cobalt/40 mb-3">
                      # {kategoriTerpilih.nama}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-ink mb-3 break-words">
                    {values.judul || '(Belum ada judul)'}
                  </h3>
                  <KontenTeks teks={values.konten || '(Belum ada isi)'} />
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Pratinjau gambar lampiran"
                      className="mt-4 max-h-96 w-auto max-w-full rounded-lg border border-ink/20"
                    />
                  )}
                </>
              ) : (
                <p className="text-sm text-ink/55 italic">Belum ada yang bisa dipratinjau.</p>
              )}
            </div>
          )}
          <PesanError id="err-konten" pesan={pesan('konten')} />
        </div>

        {/* Gambar (opsional) */}
        <div>
          <label htmlFor="field-gambar" className="block text-sm font-semibold text-ink mb-2">
            Gambar <span className="font-normal text-ink/55">(opsional)</span>
          </label>
          <input
            ref={inputGambar}
            id="field-gambar"
            name="gambar"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={saatPilihGambar}
            aria-invalid={Boolean(pesanGambar)}
            aria-describedby="err-gambar info-gambar"
            className="block w-full text-sm text-ink/80 file:mr-4 file:cursor-pointer file:rounded-xl file:border file:border-ink/20 file:bg-white file:px-4 file:py-2 file:text-sm file:font-semibold file:text-ink hover:file:bg-sun rounded-lg bg-white border border-dashed border-ink/20 p-3"
          />
          <p id="info-gambar" className="mt-1.5 text-[11px] text-ink/55">
            JPG, PNG, WebP, atau GIF. Maksimal {BATAS.gambarMaxBytes / (1024 * 1024)} MB.
          </p>
          <PesanError id="err-gambar" pesan={pesanGambar} />
          {gambar && previewUrl && (
            <div className="mt-3 flex items-start gap-4 rounded-lg bg-ink/5 border border-ink/20 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Pratinjau gambar yang dipilih"
                className="h-24 w-24 shrink-0 rounded-xl object-cover border border-ink/20"
              />
              <div className="min-w-0 flex-1 text-xs text-ink/80">
                <p className="truncate font-semibold text-ink">{gambar.name}</p>
                <p className="mt-0.5 text-ink/55">{formatUkuran(gambar.size)}</p>
                <button
                  type="button"
                  onClick={hapusGambar}
                  className="mt-2 font-semibold text-coral underline hover:text-coral"
                >
                  Hapus gambar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Penulis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="field-penulis" className="text-sm font-semibold text-ink">
              Nama kamu
            </label>
            <Penghitung nilai={values.penulis.length} maks={BATAS.penulisMax} />
          </div>
          <input
            id="field-penulis"
            name="penulis"
            type="text"
            value={values.penulis}
            onChange={ubah('penulis')}
            onBlur={sentuh('penulis')}
            maxLength={BATAS.penulisMax}
            autoComplete="nickname"
            placeholder="Nama atau nama panggilan"
            aria-invalid={Boolean(pesan('penulis'))}
            aria-describedby="err-penulis"
            className={kelasInput('penulis')}
          />
          <PesanError id="err-penulis" pesan={pesan('penulis')} />
        </div>

        <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
          <Link
            href="/"
            className="px-5 py-3 rounded-lg bg-white hover:bg-paper border border-ink/20 text-sm font-semibold text-ink transition-all"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-lg bg-cobalt disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm  transition-all   inline-flex items-center gap-2"
          >
            {isPending && (
              <span className="w-4 h-4 rounded-full border-2 border-ink/20 border-t-white animate-spin"></span>
            )}
            {isPending ? (gambar ? 'Mengunggah...' : 'Memposting...') : 'Posting Diskusi'}
          </button>
        </div>
      </form>

      {/* Sidebar tips */}
      <aside className="space-y-6">
        <div className=" border border-cobalt/40 rounded-xl p-6 text-sm text-ink/80 shadow-hard-sm">
          <h2 className="font-bold text-ink mb-3">💡 Tips diskusi yang seru</h2>
          <ul className="space-y-2.5 text-xs text-ink/80 leading-relaxed list-disc pl-4">
            <li>Pakai judul yang spesifik, bukan sekadar &quot;tanya dong&quot;.</li>
            <li>Sebutkan mata kuliah atau konteksnya biar mudah dijawab.</li>
            <li>Cek dulu lewat pencarian, siapa tahu topiknya sudah ada.</li>
            <li>Gunakan bahasa yang sopan ke sesama anggota.</li>
          </ul>
        </div>
        <div className="rounded-xl bg-white border border-ink/20 p-6 text-xs text-ink/65 leading-relaxed">
          Draf tulisanmu tersimpan otomatis di browser ini, jadi aman kalau tab tidak sengaja
          tertutup.
        </div>
      </aside>
    </div>
  )
}