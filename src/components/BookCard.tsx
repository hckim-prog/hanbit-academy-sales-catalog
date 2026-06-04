import { BookPlus, Check, Eye, GraduationCap } from 'lucide-react'
import type { Book } from '../types/book'
import { formatDate } from '../lib/utils'

interface BookCardProps {
  book: Book
  selected: boolean
  onOpen: () => void
  onToggleSelected: () => void
}

export function BookCard({ book, selected, onOpen, onToggleSelected }: BookCardProps) {
  return (
    <article className="book-card group rounded-2xl border border-slate-200 bg-white/95 shadow-sm shadow-slate-950/5 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-950/10">
      <div className="cover-wrap">
        <img
          className="rounded-xl shadow-md shadow-slate-950/10 transition duration-200 group-hover:shadow-lg"
          src={book.cover_url}
          alt={`${book.title} 표지`}
        />
        <span>{book.ai_primary_category}</span>
      </div>
      <div className="book-main">
        <div className="book-card-head">
          <div>
            <span className="category-label">{book.ai_primary_category}</span>
            <h3>{book.title}</h3>
          </div>
        </div>
        <div className="book-badge-row" aria-label="영업 신호">
          {book.is_strategy_book && <span className="badge accent">전략도서</span>}
        </div>
        <div className="fit-strip" aria-label="상담 핵심 지표">
          <span>
            <GraduationCap size={15} /> {book.target_grade || '학년 미정'}
          </span>
          <span>{book.difficulty_level || '난이도 미정'}</span>
        </div>
        <div className="tag-row">
          {book.course_tags.slice(0, 3).map((tag) => (
            <span key={tag} className="badge">
              {tag}
            </span>
          ))}
        </div>
        <p className="summary">{book.one_line_summary}</p>
        <p className="authors">
          {book.authors.join(', ')} · {formatDate(book.pub_date)}
        </p>
        <div className="book-signals">
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
