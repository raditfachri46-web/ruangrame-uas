function escapeRegex(teks: string): string {
  return teks.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Menandai kata kunci pencarian di dalam teks
export function Highlight({ teks, kataKunci }: { teks: string; kataKunci: string }) {
  const daftarKata = kataKunci.split(' ').filter(Boolean)
  if (daftarKata.length === 0) return <>{teks}</>

  const regex = new RegExp(`(${daftarKata.map(escapeRegex).join('|')})`, 'gi')
  const bagian = teks.split(regex) // indeks ganjil = bagian yang cocok

  return (
    <>
      {bagian.map((b, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded bg-sun/50 text-ink px-0.5">
            {b}
          </mark>
        ) : (
          b
        )
      )}
    </>
  )
}