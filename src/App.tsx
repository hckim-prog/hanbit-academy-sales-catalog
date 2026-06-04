import { useEffect, useMemo, useState } from 'react'
import { ArrowUp, ListPlus } from 'lucide-react'
import { AppShell } from './components/AppShell'
import { BookDetailDialog } from './components/BookDetailDialog'
import { EmptyState } from './components/EmptyState'
import { ErrorState } from './components/ErrorState'
import { HeroSearch } from './components/HeroSearch'
import { LoadingState } from './components/LoadingState'
import { SelectedBooksSheet } from './components/SelectedBooksSheet'
import { BookCard } from './components/BookCard'
import { CategoryOverview } from './components/CategoryOverview'
import { CourseTagFilter } from './components/CourseTagFilter'
import { UpdateStatusBadge } from './components/UpdateStatusBadge'
import mergedBooks from '../data/books_merged.json'
import sampleBooks from '../data/books_merged.sample.json'
import updateReport from '../data/update_report.json'
import { useSelectedBooks } from './lib/useSelectedBooks'
import { filterBooks, getCatalogFacets, sortBooks } from './lib/catalog'
import type { Book, SortKey } from './types/book'

const pageSize = 30

function App() {
  const operationalBooks = mergedBooks as Book[]
  const books = operationalBooks.length ? operationalBooks : (sampleBooks as Book[])
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [courseTag, setCourseTag] = useState('전체')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [flags, setFlags] = useState({
    strategy: false,
    digital: false,
    materials: false,
    review: false,
    newOnly: false,
  })
  const [detailBook, setDetailBook] = useState<Book | null>(null)
  const [selectedOpen, setSelectedOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(pageSize)
  const selected = useSelectedBooks(books)
  const facets = useMemo(() => getCatalogFacets(books), [books])
  const filteredBooks = useMemo(
    () =>
      sortBooks(
        filterBooks(books, { query, category, courseTag, flags }),
        sortKey,
      ),
    [books, query, category, courseTag, flags, sortKey],
  )
  const visibleBooks = filteredBooks.slice(0, visibleCount)
  const hasMoreBooks = visibleCount < filteredBooks.length

  const resetVisibleBooks = (scrollToList = true) => {
    setVisibleCount(pageSize)
    if (!scrollToList) return
    requestAnimationFrame(() => {
      document
        .querySelector('.catalog-toolbar')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      const target = event.target as HTMLElement | null
      const scrollableOverlay = target?.closest('.dialog-content, .sheet-content, .tag-scroll')
      if (scrollableOverlay) return
      event.preventDefault()
      window.scrollBy({ top: event.deltaY, left: 0, behavior: 'auto' })
    }

    let touchStartY = 0
    const handleTouchStart = (event: TouchEvent) => {
      touchStartY = event.touches[0]?.clientY ?? 0
    }
    const handleTouchMove = (event: TouchEvent) => {
      const target = event.target as HTMLElement | null
      const scrollableOverlay = target?.closest('.dialog-content, .sheet-content, .tag-scroll')
      if (scrollableOverlay) return
      const currentY = event.touches[0]?.clientY ?? touchStartY
      const deltaY = touchStartY - currentY
      touchStartY = currentY
      event.preventDefault()
      window.scrollBy({ top: deltaY, left: 0, behavior: 'auto' })
    }

    window.addEventListener('wheel', handleWheel, { passive: false })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  if (!books.length) return <LoadingState label="카탈로그 데이터를 불러오는 중입니다." />

  return (
    <AppShell
      selectedCount={selected.selectedBooks.length}
      onOpenSelected={() => setSelectedOpen(true)}
    >
      <HeroSearch
        query={query}
        onQueryChange={(value) => {
          setQuery(value)
          resetVisibleBooks(false)
        }}
        totalBooks={books.length}
        filteredCount={filteredBooks.length}
        selectedCount={selected.selectedBooks.length}
        report={updateReport}
        onViewAll={() =>
          document
            .querySelector('.catalog-toolbar')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
        onOpenSelected={() => setSelectedOpen(true)}
        flags={flags}
        onFlagsChange={(nextFlags) => {
          setFlags(nextFlags)
          resetVisibleBooks()
        }}
      />

      <section className="overview-row">
        <CategoryOverview
          categories={facets.categories}
          activeCategory={category}
          onSelectCategory={(nextCategory) => {
            setCategory(nextCategory)
            resetVisibleBooks()
          }}
        />
        <div className="status-panel">
          <div>
            <span className="eyebrow">업데이트 상태</span>
            <h2>검수 중심 반자동 운영</h2>
          </div>
          <UpdateStatusBadge report={updateReport} />
        </div>
      </section>

      <CourseTagFilter
        tags={facets.courseTags}
        activeTag={courseTag}
        onSelectTag={(nextTag) => {
          setCourseTag(nextTag)
          resetVisibleBooks()
        }}
      />

      <section id="catalog-list" className="catalog-toolbar" aria-label="도서 목록 도구">
        <div>
          <span className="eyebrow">검색 결과</span>
          <h2>전체 {books.length}권 중 {filteredBooks.length}권</h2>
          <p className="result-meta">
            지금 {visibleBooks.length}권 표시 · 검색과 필터는 전체 데이터 기준
          </p>
        </div>
        <div className="toolbar-controls">
          <select
            value={sortKey}
            onChange={(event) => {
              setSortKey(event.target.value as SortKey)
              resetVisibleBooks()
            }}
            aria-label="정렬"
          >
            <option value="newest">신간순</option>
            <option value="title">도서명순</option>
            <option value="category">분야순</option>
            <option value="salesPriority">영업 우선순위순</option>
            <option value="lowConfidence">AI 신뢰도 낮은 순</option>
            <option value="updated">최근 업데이트순</option>
          </select>
        </div>
      </section>

      {filteredBooks.length ? (
        <>
          <section className="book-grid" aria-label="도서 목록">
            {visibleBooks.map((book) => (
              <BookCard
                key={book.book_id}
                book={book}
                selected={selected.isSelected(book.book_id)}
                onOpen={() => setDetailBook(book)}
                onToggleSelected={() => selected.toggleBook(book.book_id)}
              />
            ))}
          </section>
          <section className="list-progress" aria-label="목록 표시 상태">
            <div>
              <strong>{visibleBooks.length}</strong>
              <span> / {filteredBooks.length}권 표시 중</span>
            </div>
            <div className="list-progress-actions">
              {hasMoreBooks && (
                <button
                  type="button"
                  className="secondary-action load-more-action"
                  onClick={() =>
                    setVisibleCount((count) =>
                      Math.min(count + pageSize, filteredBooks.length),
                    )
                  }
                >
                  <ListPlus size={18} />
                  30권 더 보기
                </button>
              )}
              <button
                type="button"
                className="secondary-action"
                onClick={() =>
                  document
                    .querySelector('.catalog-toolbar')
                    ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }
              >
                <ArrowUp size={18} />
                목록 맨 위로
              </button>
            </div>
          </section>
        </>
      ) : query ? (
        <EmptyState title="조건에 맞는 도서가 없습니다." />
      ) : (
        <ErrorState title="표시할 도서 데이터가 없습니다." />
      )}

      <BookDetailDialog
        book={detailBook}
        selected={detailBook ? selected.isSelected(detailBook.book_id) : false}
        onOpenChange={(open) => !open && setDetailBook(null)}
        onToggleSelected={() => detailBook && selected.toggleBook(detailBook.book_id)}
      />
      <SelectedBooksSheet
        open={selectedOpen}
        onOpenChange={setSelectedOpen}
        books={selected.selectedBooks}
        onRemove={selected.removeBook}
        onClear={selected.clearBooks}
      />
    </AppShell>
  )
}

export default App
