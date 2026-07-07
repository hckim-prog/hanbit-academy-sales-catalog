import { BookMarked, LibraryBig } from 'lucide-react'
import type { ReactNode } from 'react'

interface AppShellProps { children: ReactNode; selectedCount: number; onOpenSelected: () => void }

export function AppShell({ children, selectedCount, onOpenSelected }: AppShellProps) {
  return (
    <div className="app-shell">
      <header className="simple-topbar">
        <a className="simple-brand" href="#top" aria-label="한빛아카데미 카탈로그 처음으로">
          <LibraryBig size={23} />
          <span><strong>한빛아카데미</strong><small>영업용 교재 카탈로그</small></span>
        </a>
        <button type="button" className="selected-button" onClick={onOpenSelected}>
          <BookMarked size={18} /> 관심 도서 <strong>{selectedCount}</strong>
        </button>
      </header>
      <main id="top">{children}</main>
      <footer className="app-footer">한빛아카데미 · 교수 상담용 디지털 카탈로그</footer>
    </div>
  )
}
