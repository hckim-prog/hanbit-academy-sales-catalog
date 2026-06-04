import { BookMarked, LibraryBig, Mail, ShoppingBag } from 'lucide-react'
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
            <span>교수 상담용 웹 카탈로그</span>
          </div>
        </div>
        <nav className="top-actions" aria-label="주요 작업">
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
        <ShoppingBag size={16} />
        <span>가격보다 강좌 적합성, 제공 자료, 디지털 교재 여부를 우선 표시합니다.</span>
      </footer>
    </div>
  )
}
