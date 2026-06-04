import { BookPlus, Check, Eye, FileText, GraduationCap, MonitorCheck } from 'lucide-react'
import type { Book } from '../types/book'
import { isNewBook } from '../lib/utils'
import { ReviewRequiredBadge } from './ReviewRequiredBadge'

interface BookCardProps {
  book: Book
  selected: boolean
  onOpen: () => void
  onToggleSelected: () => void
}

export function BookCard({ book, selected, onOpen, onToggleSelected }: BookCardProps) {
  return (
    <article className="book-card">
      <div className="cover-wrap">
        <img src={book.cover_url} alt={`${book.title} 표지`} />
        <span>{isNewBook(book.pub_date) ? '신간' : book.ai_primary_category}</span>
      </div>
      <div className="book-main">
        <div className="book-card-head">
          <div>
            <span className="category-label">{book.ai_primary_category}</span>
            <h3>{book.title}</h3>
          </div>
          <ReviewRequiredBadge required={book.review_required} />
        </div>
        <div className="fit-strip" aria-label="상담 핵심 지표">
          <span>
            <GraduationCap size={15} /> {book.target_grade || '학년 미정'}
          </span>
          <span>{book.difficulty_level || '난이도 미정'}</span>
          <span>
            <FileText size={14} /> {book.has_ppt || book.has_solution || book.has_sample ? '강의자료' : '자료 확인'}
          </span>
          <span>
            <MonitorCheck size={14} /> {book.is_digital_textbook || book.ebook_available ? '디지털' : '종이책'}
          </span>
        </div>
        <div className="tag-row">
          {book.course_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
        <p className="summary">{book.one_line_summary}</p>
        <p className="authors">{book.authors.join(', ')}</p>
        <div className="book-signals">
          {book.is_strategy_book && <strong>전략</strong>}
          {book.confidence < 0.85 && <span>AI 검수 {Math.round(book.confidence * 100)}%</span>}
          {book.sales_priority && <span>우선순위 {book.sales_priority}</span>}
        </div>
        <div className="card-actions">
          <button type="button" className="secondary-action" onClick={onOpen}>
            <Eye size={17} />
            상세보기
          </button>
          <button type="button" className={selected ? 'select-action active' : 'select-action'} onClick={onToggleSelected}>
            {selected ? <Check size={17} /> : <BookPlus size={17} />}
            {selected ? '담김' : '관심 도서'}
          </button>
        </div>
      </div>
    </article>
  )
}
