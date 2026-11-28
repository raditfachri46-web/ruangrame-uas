// Menampilkan teks thread apa adanya (enter tetap enter) + URL http(s) jadi link.
// React otomatis meng-escape teks, jadi aman dari injeksi HTML/script.
const REGEX_URL = /(https?:\/\/[^\s<]+)/g

export function KontenTeks({ teks }: { teks: string }) {
  const bagian = teks.split(REGEX_URL) // indeks ganjil = URL

  return (
    <div className="whitespace-pre-wrap break-words leading-relaxed text-slate-200">
      {bagian.map((b, i) => {
        if (i % 2 === 0) return b
        const url = b.replace(/[.,;:!?)\]]+$/, '') // buang tanda baca di ujung
        const sisa = b.slice(url.length)
        return (
          <span key={i}>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer nofollow ugc"
              className="text-fuchsia-300 underline underline-offset-2 hover:text-amber-300 break-all"
            >
              {url}
            </a>
            {sisa}
          </span>
        )
      })}
    </div>
  )
}
