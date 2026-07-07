import { Search } from 'lucide-react'

interface HeroSearchProps { query: string; onQueryChange: (value: string) => void; onSubmit: () => void; totalBooks: number }

export function HeroSearch({ query, onQueryChange, onSubmit, totalBooks }: HeroSearchProps) {
  return (
    <section className="simple-hero">
      <span className="hero-kicker">HANBIT ACADEMY CATALOG</span>
      <h1>강의에 필요한 교재를<br />빠르게 찾아보세요</h1>
      <p>{totalBooks.toLocaleString()}권의 한빛아카데미 도서를 분야·도서명·저자·ISBN으로 검색할 수 있습니다.</p>
      <form className="course-search" onSubmit={(event) => { event.preventDefault(); onSubmit() }}>
        <Search size={25} aria-hidden="true" />
        <input aria-label="도서 검색" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="도서명, 저자, 분야 또는 ISBN 검색" autoComplete="off" />
        <button type="submit">검색</button>
      </form>
    </section>
  )
}
