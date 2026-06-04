import { BookMarked, LibraryBig, Mail, SearchCheck } from 'lucide-react'
import type { ReactNode } from 'react'

interface AppShellProps {
  children: ReactNode
  selectedCount: number
  onOpenSelected: () => void
}

export function AppShell({ children, selectedCount, onOpenSelected }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">
            <LibraryBig size={22} />
          </div>
          <div>
            <strong>Hanbit Academy Sales Catalog</strong>
            <span>Premium Course Finder</span>
          </div>
        </div>
        <nav className="top-actions" aria-label="주요 작업">
          <a href="#catalog-list" className="top-nav-link">전체 도서</a>
          <a href="#catalog-list" className="top-nav-link">신간</a>
          <a href="#catalog-list" className="top-nav-link">베스트셀러</a>
          <a href="#catalog-list" className="top-nav-link">전공별 서치</a>
          <button type="button" className="icon-button" title="Gmail 공유">
            <Mail size={18} />
          </button>
          <button type="button" className="selected-button" onClick={onOpenSelected}>
            <BookMarked size={18} />
            관심 도서 {selectedCount}
          </button>
        </nav>
      </header>
      <main>{children}</main>
      <footer className="app-footer">
        <SearchCheck size={16} />
        <span>강좌 적합성, 제공 자료, 디지털 교재 여부를 중심으로 상담 후보를 정리합니다.</span>
      </footer>
    </div>
  )
}
