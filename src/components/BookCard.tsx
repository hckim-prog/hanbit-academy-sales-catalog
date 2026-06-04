import { BookPlus, Check, Eye, GraduationCap, Sparkles } from 'lucide-react'
import type { Book } from '../types/book'
import { formatDate, isNewBook } from '../lib/utils'

interface BookCardProps {
  book: Book
  selected: boolean
  onOpen: () => void
  onToggleSelected: () => void
}

export function BookCard({ book, selected, onOpen, onToggleSelected }: BookCardProps) {
  const isNew = isNewBook(book.pub_date)
  const isBest = book.sales_priority === 'A' || book.is_strategy_book

  return (
    <article className="book-card group rounded-[22px] border border-white/80 bg-white/75 shadow-md shadow-slate-900/5 backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-900/10">
      <div className="cover-wrap">
        <img
          className="rounded-2xl shadow-[0_18px_40px_rgba(0,0,0,0.42)] transition duration-300 group-hover:shadow-[0_22px_54px_rgba(103,232,249,0.16)]"
          src={book.cover_url}
          alt={`${book.title} 표지`}
        />
      </div>
      <div className="book-main">
        <div className="book-card-head">
          <div>
            <span className="category-label">{book.ai_primary_category}</span>
            <h3>{book.title}</h3>
          </div>
        </div>
        <div className="book-badge-row" aria-label="영업 신호">
          {isNew && (
            <span className="badge neon-cyan">
              <Sparkles size={13} /> NEW
            </span>
          )}
          {isBest && <span className="badge neon-magenta">BEST</span>}
        </div>
        <div className="fit-strip" aria-label="상담 핵심 지표">
          <span>
            <GraduationCap size={15} /> {book.target_grade || '학년 미정'}
          </span>
          <span>{book.difficulty_level || '난이도 미정'}</span>
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
