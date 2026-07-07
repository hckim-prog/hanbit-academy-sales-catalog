import { BookMarked, CheckCircle2, LibraryBig } from 'lucide-react'
import type { ReactNode } from 'react'

interface AppShellProps { children: ReactNode; lastUpdatedAt: string; selectedCount: number; onOpenSelected: () => void }

export function AppShell({ children, lastUpdatedAt, selectedCount, onOpenSelected }: AppShellProps) {
  const formattedUpdate = formatKoreanDateTime(lastUpdatedAt)
  return (
    <div className="app-shell">
      <header className="simple-topbar">
        <a className="simple-brand" href="#top" aria-label="한빛아카데미 카탈로그 처음으로">
          <LibraryBig size={23} />
          <span><strong>한빛아카데미</strong><small>영업용 교재 카탈로그</small></span>
        </a>
        {formattedUpdate && (
          <div className="catalog-updated" title="실제 도서 데이터가 마지막으로 변경된 시각입니다.">
            <CheckCircle2 size={15} />
            <span>도서정보 업데이트</span>
            <time dateTime={lastUpdatedAt}>{formattedUpdate}</time>
          </div>
        )}
        <button type="button" className="selected-button" onClick={onOpenSelected}>
          <BookMarked size={18} /> 관심 도서 <strong>{selectedCount}</strong>
        </button>
      </header>
      <main id="top">{children}</main>
      <footer className="app-footer">한빛아카데미 · 교수 상담용 디지털 카탈로그</footer>
    </div>
  )
}

function formatKoreanDateTime(value: string) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date)
}
