import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { AppShell } from './components/AppShell'
import { BookCard } from './components/BookCard'
import { EmptyState } from './components/EmptyState'
import { HeroSearch } from './components/HeroSearch'
import { LoadingState } from './components/LoadingState'
import { useSelectedBooks } from './lib/useSelectedBooks'
import { rankBooks } from './lib/catalog'
import type { Book } from './types/book'

const BookDetailDialog = lazy(() => import('./components/BookDetailDialog').then((module) => ({ default: module.BookDetailDialog })))
const SelectedBooksSheet = lazy(() => import('./components/SelectedBooksSheet').then((module) => ({ default: module.SelectedBooksSheet })))
const catalogUrl = new URL('../data/books_catalog.json', import.meta.url).href
const initialResultCount = 10

function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [query, setQuery] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [visibleCount, setVisibleCount] = useState(initialResultCount)
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [selectedOpen, setSelectedOpen] = useState(false)
  const [loadError, setLoadError] = useState(false)
  const selected = useSelectedBooks(books)

  useEffect(() => {
    const controller = new AbortController()
    fetch(catalogUrl, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error('catalog load failed')
        return response.json() as Promise<Book[]>
      })
      .then(setBooks)
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setLoadError(true)
      })
    return () => controller.abort()
  }, [])

  const results = useMemo(() => {
    const ranked = rankBooks(books, submittedQuery)
    return category === '전체' ? ranked : ranked.filter((book) => book.ai_primary_category === category)
  }, [books, submittedQuery, category])

  const categories = useMemo(() => {
    const counts = new Map<string, number>()
    books.forEach((book) => counts.set(book.ai_primary_category, (counts.get(book.ai_primary_category) ?? 0) + 1))
    return ['전체', ...Array.from(counts.keys()).sort((a, b) => a.localeCompare(b, 'ko-KR'))].map((name) => ({
      name,
      count: name === '전체' ? books.length : counts.get(name) ?? 0,
    }))
  }, [books])

  const moveToResults = () => requestAnimationFrame(() => document.querySelector('#catalog-list')?.scrollIntoView({ behavior: 'smooth' }))

  const submitSearch = () => {
    setSubmittedQuery(query.trim())
    setCategory('전체')
    setVisibleCount(initialResultCount)
    moveToResults()
  }

  const selectCategory = (nextCategory: string) => {
    setCategory(nextCategory)
    setSubmittedQuery('')
    setQuery('')
    setVisibleCount(initialResultCount)
    moveToResults()
  }

  if (loadError) return <EmptyState title="카탈로그를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요." />
  if (!books.length) return <LoadingState label="상담용 도서를 준비하고 있습니다." />

  const visibleBooks = results.slice(0, visibleCount)
  const resultTitle = submittedQuery ? `“${submittedQuery}” 검색 결과` : category !== '전체' ? `${category} 도서` : '최근 출간 도서'

  return (
    <AppShell selectedCount={selected.selectedBooks.length} onOpenSelected={() => setSelectedOpen(true)}>
      <HeroSearch query={query} onQueryChange={setQuery} onSubmit={submitSearch} totalBooks={books.length} />

      <nav className="discipline-browser" aria-label="분야별 도서 찾기">
        <div className="discipline-heading">
          <div><span className="eyebrow">Browse by discipline</span><h2>분야별 도서 찾기</h2></div>
          <p>상담 분야를 선택하면 해당 도서만 바로 볼 수 있습니다.</p>
        </div>
        <div className="discipline-grid">
          {categories.map((item) => (
            <button type="button" key={item.name} className={category === item.name ? 'discipline-button active' : 'discipline-button'} onClick={() => selectCategory(item.name)}>
              <span>{item.name}</span><small>{item.count.toLocaleString()}권</small>
            </button>
          ))}
        </div>
      </nav>

      <section id="catalog-list" className="simple-results" aria-labelledby="result-title">
        <div className="result-heading">
          <div>
            <span className="eyebrow">Catalog</span>
            <h2 id="result-title">{resultTitle}</h2>
            <p>{results.length.toLocaleString()}권의 도서를 확인할 수 있습니다.</p>
          </div>
        </div>

        {visibleBooks.length ? (
          <>
            <div className="book-grid">
              {visibleBooks.map((book) => (
                <BookCard key={book.book_id} book={book} selected={selected.isSelected(book.book_id)} onOpen={() => setDetailBook(book)} onToggleSelected={() => selected.toggleBook(book.book_id)} />
              ))}
            </div>
            {visibleCount < results.length && <button type="button" className="load-more-simple" onClick={() => setVisibleCount((count) => count + 10)}>도서 10권 더 보기</button>}
          </>
        ) : <EmptyState title="검색 결과가 없습니다. 다른 도서명·저자·분야로 검색해 주세요." />}
      </section>

      <Suspense fallback={null}>
        <BookDetailDialog key={detailBook?.book_id ?? 'closed'} book={detailBook} selected={detailBook ? selected.isSelected(detailBook.book_id) : false} onOpenChange={(open) => !open && setDetailBook(null)} onToggleSelected={() => detailBook && selected.toggleBook(detailBook.book_id)} />
        <SelectedBooksSheet open={selectedOpen} onOpenChange={setSelectedOpen} books={selected.selectedBooks} onRemove={selected.removeBook} onClear={selected.clearBooks} />
      </Suspense>
    </AppShell>
  )
}

export default App
