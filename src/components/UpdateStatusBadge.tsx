import { RotateCcw } from 'lucide-react'
import type { UpdateReport } from '../types/book'
import { formatDate } from '../lib/utils'

export function UpdateStatusBadge({ report }: { report: UpdateReport }) {
  return (
    <div className="update-status">
      <RotateCcw size={18} />
      <div>
        <strong>{formatDate(report.last_updated_at)}</strong>
        <span>
          신규 {report.new_books.length} · 변경 {report.changed_books.length} · 검수{' '}
          {report.review_required_books.length}
        </span>
      </div>
    </div>
  )
}
