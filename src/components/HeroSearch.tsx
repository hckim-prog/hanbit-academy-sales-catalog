import {
  BookmarkCheck,
  DatabaseZap,
  Mail,
  Search,
} from 'lucide-react'
import type { UpdateReport } from '../types/book'

interface HeroSearchProps {
  query: string
  onQueryChange: (value: string) => void
  totalBooks: number
  filteredCount: number
  selectedCount: number
  report: UpdateReport
  onViewAll: () => void
  onOpenSelected: () => void
}

export function HeroSearch({
  query,
  onQueryChange,
  totalBooks,
  filteredCount,
  selectedCount,
  report,
  onViewAll,
  onOpenSelected,
}: HeroSearchProps) {
  return (
    <section className="hero-search">
      <div className="hero-copy">
        <span className="hero-eyebrow">Hanbit Academy Sales Catalog</span>
        <h1>교수님 강의에 맞는 교재를 빠르게 찾고 공유하세요</h1>
        <p className="hero-lede">
          분야, 강좌, 난이도, 디지털 교재 여부를 기준으로 도서를 찾고, 관심 도서를 담아 Gmail로 바로 공유할 수 있습니다.
        </p>
        <form
          className="hero-search-box"
          onSubmit={(event) => {
            event.preventDefault()
            onViewAll()
          }}
        >
          <div className="search-input hero-input">
            <Search size={24} />
            <input
              aria-label="도서 검색"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="도서명, 저자, 강좌명, ISBN으로 검색"
            />
            <button type="submit" className="hero-search-submit">
              검색
            </button>
          </div>
          <p className="hero-search-feedback" aria-live="polite">
            {query.trim()
              ? `전체 ${totalBooks.toLocaleString()}권 중 ${filteredCount.toLocaleString()}권이 검색 조건과 일치합니다.`
              : `전체 ${totalBooks.toLocaleString()}권을 도서명, 저자, 강좌명, ISBN으로 검색합니다.`}
          </p>
          <div className="hero-cta-row">
            <a
              href="#catalog-list"
              className="primary-action hero-primary"
              onClick={(event) => {
                event.preventDefault()
                onViewAll()
              }}
            >
              <DatabaseZap size={18} />
              전체 도서 보기
            </a>
            <button
              type="button"
              className="secondary-action hero-secondary"
              onClick={onOpenSelected}
            >
              <BookmarkCheck size={18} />
              관심 도서 열기 {selectedCount}
            </button>
          </div>
        </form>
      </div>

      <div className="hero-preview" aria-label="상담 미리보기">
        <button
          type="button"
          className="preview-card selected-preview-card"
          onClick={onOpenSelected}
        >
          <span className="preview-label">
            <Mail size={14} /> 관심 도서
          </span>
          <strong>{selectedCount}권 선택 · Gmail 공유</strong>
          <p>선택한 도서를 교수님께 바로 공유합니다.</p>
        </button>
        <div className="preview-card data-card">
          <div>
            <span className="preview-label">업데이트 상태</span>
            <strong>{totalBooks.toLocaleString()}권 운영 데이터</strong>
          </div>
          <dl>
            <div>
              <dt>신규</dt>
              <dd>{report.new_books.length}</dd>
            </div>
            <div>
              <dt>검수</dt>
              <dd>{report.review_required_books.length}</dd>
            </div>
            <div>
              <dt>실패</dt>
              <dd>{report.crawl_failed_urls.length}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
