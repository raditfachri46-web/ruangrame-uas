'use client'

import Link from 'next/link'
import { useActionState, useEffect, useRef, useState } from 'react'
import type { ChangeEvent, FormEvent } from 'react'
import { buatThread } from '@/app/buat-thread/actions'
import { KontenTeks } from '@/components/KontenTeks'
import {
  BATAS,
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

function Penghitung({ nilai, maks }: { nilai: number; maks: number }) {
  const hampir = nilai >= maks * 0.9
  return (
    <span className={`text-[11px] tabular-nums ${hampir ? 'text-amber-300' : 'text-slate-500'}`}>
      {nilai}/{maks}
    </span>
  )
}

function PesanError({ id, pesan }: { id: string; pesan?: string }) {
  if (!pesan) return null
  return (
    <p id={id} role="alert" className="mt-1.5 text-xs text-rose-300">
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

  function saatKirim(e: FormEvent<HTMLFormElement>) {
    setSudahCobaKirim(true)
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
    `w-full rounded-2xl bg-white/[0.05] border px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition-colors focus:bg-white/[0.08] ${
      pesan(field) ? 'border-rose-400/60 focus:border-rose-400' : 'border-white/[0.1] focus:border-fuchsia-400/60'
    }`

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <form
        action={formAction}
        onSubmit={saatKirim}
        noValidate
        className="lg:col-span-2 space-y-6 backdrop-blur-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.09] border-t-white/20 rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        {draftDipulihkan && (
          <div className="flex items-center justify-between gap-3 rounded-2xl bg-amber-500/10 border border-amber-400/25 px-4 py-3 text-xs text-amber-200">
            <span>📝 Draf terakhirmu dipulihkan otomatis.</span>
            <button type="button" onClick={hapusDraft} className="font-semibold underline hover:text-white">
              Hapus draf
            </button>
          </div>
        )}

        {state.errors.form && (
          <div role="alert" className="rounded-2xl bg-rose-500/10 border border-rose-400/30 px-4 py-3 text-sm text-rose-200">
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
          <legend className="text-sm font-semibold text-slate-200 mb-2">Kategori</legend>
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
                <span className="inline-block px-4 py-2 rounded-xl text-sm font-medium border border-white/[0.1] bg-white/[0.04] text-slate-300 hover:border-fuchsia-400/40 peer-checked:bg-fuchsia-500/20 peer-checked:border-fuchsia-400/60 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-fuchsia-400 transition-colors">
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
            <label htmlFor="field-judul" className="text-sm font-semibold text-slate-200">
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
            <label htmlFor="field-konten" className="text-sm font-semibold text-slate-200">
              Isi diskusi
            </label>
            <div className="flex items-center gap-3">
              <div className="inline-flex rounded-xl bg-white/[0.05] border border-white/[0.1] p-0.5 text-xs font-semibold">
                {(['tulis', 'pratinjau'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMode(m)}
                    aria-pressed={mode === m}
                    className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                      mode === m ? 'bg-violet-600/50 text-white' : 'text-slate-400 hover:text-white'
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
            <div className="rounded-2xl bg-black/20 border border-white/[0.1] p-5 min-h-[16rem]">
              {values.judul || values.konten ? (
                <>
                  {kategoriTerpilih && (
                    <span className="inline-block px-3 py-1 rounded-xl bg-fuchsia-500/15 text-fuchsia-300 text-xs font-semibold border border-fuchsia-400/25 mb-3">
                      # {kategoriTerpilih.nama}
                    </span>
                  )}
                  <h3 className="text-xl font-bold text-white mb-3 break-words">
                    {values.judul || '(Belum ada judul)'}
                  </h3>
                  <KontenTeks teks={values.konten || '(Belum ada isi)'} />
                </>
              ) : (
                <p className="text-sm text-slate-500 italic">Belum ada yang bisa dipratinjau.</p>
              )}
            </div>
          )}
          <PesanError id="err-konten" pesan={pesan('konten')} />
        </div>

        {/* Penulis */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="field-penulis" className="text-sm font-semibold text-slate-200">
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
            className="px-5 py-3 rounded-2xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.1] text-sm font-semibold text-slate-200 transition-all"
          >
            Batal
          </Link>
          <button
            type="submit"
            disabled={isPending}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 hover:from-violet-500 hover:via-fuchsia-500 hover:to-rose-400 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold text-sm shadow-lg shadow-fuchsia-600/30 transition-all active:scale-95 border border-white/25 inline-flex items-center gap-2"
          >
            {isPending && (
              <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin"></span>
            )}
            {isPending ? 'Memposting...' : 'Posting Diskusi'}
          </button>
        </div>
      </form>

      {/* Sidebar tips */}
      <aside className="space-y-6">
        <div className="backdrop-blur-2xl bg-gradient-to-br from-violet-950/35 via-fuchsia-950/20 to-amber-950/15 border border-violet-400/25 rounded-3xl p-6 text-sm text-slate-300 shadow-xl">
          <h2 className="font-bold text-white mb-3">💡 Tips diskusi yang seru</h2>
          <ul className="space-y-2.5 text-xs text-slate-300/90 leading-relaxed list-disc pl-4">
            <li>Pakai judul yang spesifik, bukan sekadar &quot;tanya dong&quot;.</li>
            <li>Sebutkan mata kuliah atau konteksnya biar mudah dijawab.</li>
            <li>Cek dulu lewat pencarian, siapa tahu topiknya sudah ada.</li>
            <li>Gunakan bahasa yang sopan ke sesama anggota.</li>
          </ul>
        </div>
        <div className="rounded-3xl bg-white/[0.03] border border-white/[0.09] p-6 text-xs text-slate-400 leading-relaxed">
          Draf tulisanmu tersimpan otomatis di browser ini, jadi aman kalau tab tidak sengaja
          tertutup.
        </div>
      </aside>
    </div>
  )
}
