'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { buatThread } from '@/app/buat-thread/actions'
import { KontenTeks } from '@/components/KontenTeks'
import { Notice } from '@/components/ui'
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
    <span className={`text-xs tabular-nums ${hampir ? 'font-semibold text-merah' : 'text-pudar'}`}>
      {nilai}/{maks}
    </span>
  )
}

function PesanError({ id, pesan }: { id: string; pesan?: string }) {
  if (!pesan) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm text-merah">
      {pesan}
    </p>
  )
}

export function ThreadForm({
  kategori,
  judulAwal = '',
  kategoriAwal = '',
}: {
  kategori: Kategori[]
  judulAwal?: string
  kategoriAwal?: string
}) {
  const awal: FormState = {
    errors: {},
    values: { judul: judulAwal, konten: '', penulis: '', kategoriId: kategoriAwal },
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
        kategoriId: kategoriAwal || (pakaiDraft && kategoriAda ? kategoriDraft : ''),
      })
      if (pakaiDraft && (teks(draft?.judul) || teks(draft?.konten))) setDraftDipulihkan(true)
    } catch {
      // localStorage tidak tersedia / draft rusak: abaikan
    }
    siapSimpan.current = true
  }, [judulAwal, kategoriAwal, kategori])

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
  const kelasInput = (field: FieldThread) => (pesan(field) ? 'isian border-merah' : 'isian')

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <form action={formAction} onSubmit={saatKirim} noValidate className="max-w-2xl space-y-7">
        {draftDipulihkan && (
          <Notice jenis="info">
            <span className="flex flex-wrap items-center justify-between gap-3">
              <span>Draf terakhirmu sudah dipulihkan.</span>
              <button type="button" onClick={hapusDraft} className="font-semibold underline">
                Hapus draf
              </button>
            </span>
          </Notice>
        )}

        {state.errors.form && <Notice>{state.errors.form}</Notice>}

        {/* Honeypot anti-bot: jangan diisi */}
        <div className="hidden" aria-hidden="true">
          <label>
            Website
            <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
          </label>
        </div>

        {/* Kategori */}
        <fieldset aria-describedby="err-kategoriId">
          <legend className="label-isian">Kategori</legend>
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
                <span className="inline-flex min-h-10 items-center rounded-md border border-garis bg-putih px-3.5 text-sm hover:border-tinta/50 peer-checked:border-tinta/40 peer-checked:bg-stabilo peer-checked:font-semibold peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-pulpen">
                  {k.nama}
                </span>
              </label>
            ))}
          </div>
          <PesanError id="err-kategoriId" pesan={pesan('kategoriId')} />
        </fieldset>

        {/* Judul */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="field-judul" className="text-sm font-semibold">
              Judul
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
          <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <label htmlFor="field-konten" className="text-sm font-semibold">
              Isi
            </label>
            <div className="flex items-center gap-3">
              <div className="flex gap-1">
                {(['tulis', 'pratinjau'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-current={mode === m ? 'true' : undefined}
                    className="filter-tab capitalize"
                  >
                    {m}
                  </button>
                ))}
              </div>
              <Penghitung nilai={values.konten.length} maks={BATAS.kontenMax} />
            </div>
          </div>

          {/* Textarea tetap ada (disembunyikan) saat pratinjau supaya isinya tetap terkirim */}
          <textarea
            id="field-konten"
            name="konten"
            value={values.konten}
            onChange={ubah('konten')}
            onBlur={sentuh('konten')}
            maxLength={BATAS.kontenMax}
            rows={10}
            placeholder="Tulis pertanyaan atau topikmu selengkap mungkin. Link (https://...) otomatis bisa diklik."
            aria-invalid={Boolean(pesan('konten'))}
            aria-describedby="err-konten"
            className={`${kelasInput('konten')} resize-y font-serif leading-relaxed ${mode === 'tulis' ? '' : 'hidden'}`}
          />
          {mode === 'pratinjau' && (
            <div className="min-h-56 rounded-md border border-garis bg-putih p-5">
              {values.judul || values.konten ? (
                <>
                  {kategoriTerpilih && (
                    <p className="mb-2 text-sm font-medium text-pulpen">{kategoriTerpilih.nama}</p>
                  )}
                  <h3 className="mb-4 text-2xl leading-tight font-bold break-words">
                    {values.judul || '(Belum ada judul)'}
                  </h3>
                  <KontenTeks teks={values.konten || '(Belum ada isi)'} />
                  {previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={previewUrl}
                      alt="Pratinjau gambar lampiran"
                      className="mt-4 max-h-96 w-auto max-w-full rounded-sm border border-garis"
                    />
                  )}
                </>
              ) : (
                <p className="text-sm text-pudar">Belum ada yang bisa dipratinjau.</p>
              )}
            </div>
          )}
          <PesanError id="err-konten" pesan={pesan('konten')} />
        </div>

        {/* Gambar (opsional) */}
        <div>
          <label htmlFor="field-gambar" className="label-isian">
            Gambar <span className="font-normal text-pudar">(opsional)</span>
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
            className="block w-full rounded-md border border-dashed border-tinta/30 bg-putih p-3 text-sm file:mr-4 file:min-h-10 file:cursor-pointer file:rounded-md file:border file:border-tinta/25 file:bg-putih file:px-4 file:text-sm file:font-semibold hover:file:border-tinta/60"
          />
          <p id="info-gambar" className="mt-1.5 text-sm text-pudar">
            JPG, PNG, WebP, atau GIF. Maksimal {BATAS.gambarMaxBytes / (1024 * 1024)} MB.
          </p>
          <PesanError id="err-gambar" pesan={pesanGambar} />
          {gambar && previewUrl && (
            <div className="mt-3 flex items-start gap-4 border border-garis bg-putih p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewUrl}
                alt="Pratinjau gambar yang dipilih"
                className="h-24 w-32 shrink-0 rounded-sm border border-garis bg-kertas object-contain"
              />
              <div className="min-w-0 flex-1 text-sm">
                <p className="truncate font-semibold">{gambar.name}</p>
                <p className="mt-0.5 text-pudar">{formatUkuran(gambar.size)}</p>
                <button type="button" onClick={hapusGambar} className="mt-2 font-semibold text-merah underline">
                  Hapus gambar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Penulis */}
        <div>
          <div className="mb-1.5 flex items-baseline justify-between gap-3">
            <label htmlFor="field-penulis" className="text-sm font-semibold">
              Nama
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

        <div className="flex flex-wrap items-center gap-3 border-t border-garis pt-6">
          <button type="submit" disabled={isPending} className="btn-utama">
            {isPending ? (gambar ? 'Mengunggah gambar' : 'Memposting') : 'Posting thread'}
          </button>
          <Link href="/" className="btn-tenang">
            Batal
          </Link>
        </div>
      </form>

      <aside className="lg:pt-8">
        <h2 className="text-lg font-bold">Sebelum posting</h2>
        <ul className="mt-3 border-t border-garis">
          <li className="border-b border-garis py-3">Tulis judul yang bisa dipahami tanpa membuka isi thread.</li>
          <li className="border-b border-garis py-3">
            Sebut mata kuliah dan semester kalau pertanyaanmu soal tugas.
          </li>
        </ul>
        <p className="mt-4 text-sm text-pudar">
          Draf tersimpan di browser ini, jadi tab yang tertutup tidak menghapus tulisanmu.
        </p>
      </aside>
    </div>
  )
}
