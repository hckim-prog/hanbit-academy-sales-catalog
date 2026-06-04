import { SearchX } from 'lucide-react'

export function EmptyState({ title }: { title: string }) {
  return (
    <section className="state-box">
      <SearchX size={28} />
      <h2>{title}</h2>
      <p>검색어 또는 필터를 줄이면 더 넓은 상담 후보를 볼 수 있습니다.</p>
    </section>
  )
}
