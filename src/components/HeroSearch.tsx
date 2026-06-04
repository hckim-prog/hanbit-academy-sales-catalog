import {
  BookmarkCheck,
  DatabaseZap,
  GraduationCap,
  Layers3,
  Mail,
  MonitorCheck,
  Search,
  Sparkles,
} from 'lucide-react'
interface HeroSearchProps {
  query: string
  onQueryChange: (value: string) => void
  totalBooks: number
  filteredCount: number
  selectedCount: number
  onViewAll: () => void
  onOpenSelected: () => void
}

export function HeroSearch({
  query,
  onQueryChange,
  totalBooks,
  filteredCount,
  selectedCount,
  onViewAll,
  onOpenSelected,
}: HeroSearchProps) {
  return (
    <section className="hero-search">
      <div className="hero-copy">
        <span className="hero-eyebrow">B2B Course Finder for Professors</span>
        <h1 className="tracking-tight">미래를 이끄는 강의, 한빛아카데미가 제안합니다</h1>
        <p className="hero-lede">
          전공, 강좌, 난이도, 강의자료, 디지털 교재 여부를 한 번에 비교하고 교수님께 맞는 교재 후보를 빠르게 공유하세요.
        </p>
        <form
          className="hero-search-box rounded-2xl border border-slate-200/80 bg-white/80 p-2 shadow-xl shadow-slate-950/5 backdrop-blur"
          onSubmit={(event) => {
            event.preventDefault()
            onViewAll()
          }}
        >
          <div className="search-input hero-input border-0 bg-transparent shadow-none">
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
        <div className="preview-card course-signal-card border-slate-200/80 bg-white/85 shadow-xl shadow-slate-950/5">
          <span className="preview-label">
            <Sparkles size={14} /> 강좌 적합성
          </span>
          <strong>수업명 중심으로 후보 압축</strong>
          <p>분야보다 강의 상황을 먼저 보고 교재를 비교합니다.</p>
        </div>
        <button
          type="button"
          className="preview-card selected-preview-card border-slate-200/80 bg-white/85 shadow-xl shadow-slate-950/5"
          onClick={onOpenSelected}
        >
          <span className="preview-label">
            <Mail size={14} /> 관심 도서
          </span>
          <strong>{selectedCount}권 선택 · Gmail 공유</strong>
          <p>선택한 도서를 교수님께 바로 공유합니다.</p>
        </button>
        <div className="preview-grid">
          <div className="preview-card mini signal-card border-blue-100 bg-blue-50/70">
            <span className="preview-label">
              <GraduationCap size={14} /> 대상 학년
            </span>
            <strong>학년·난이도</strong>
          </div>
          <div className="preview-card mini signal-card border-emerald-100 bg-emerald-50/70">
            <span className="preview-label">
              <MonitorCheck size={14} /> 디지털
            </span>
            <strong>교재 형태</strong>
          </div>
        </div>
        <div className="preview-card data-card border-slate-200/80 bg-white/85 shadow-xl shadow-slate-950/5">
          <div>
            <span className="preview-label">카탈로그 현황</span>
            <strong>{totalBooks.toLocaleString()}권 상담 데이터</strong>
          </div>
          <dl>
            <div>
              <dt>
                <Layers3 size={13} /> 검색 결과
              </dt>
              <dd>{filteredCount.toLocaleString()}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  )
}
