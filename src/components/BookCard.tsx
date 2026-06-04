import { BookPlus, Check, Eye, FileText, GraduationCap, MonitorCheck, Sparkles } from 'lucide-react'
import type { Book } from '../types/book'
import { formatDate, isNewBook } from '../lib/utils'

interface BookCardProps {
  book: Book
  selected: boolean
  onOpen: () => void
  onToggleSelected: () => void
}

export function BookCard({ book, selected, onOpen, onToggleSelected }: BookCardProps) {
  const hasMaterials = book.has_ppt || book.has_solution || book.has_sample
  const hasDigital = book.is_digital_textbook || book.ebook_available
  const newBook = isNewBook(book.pub_date)

  return (
    <article className="book-card group rounded-2xl border border-slate-200 bg-white/95 shadow-sm shadow-slate-950/5 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-xl hover:shadow-slate-950/10">
      <div className="cover-wrap">
        <img
          className="rounded-xl shadow-md shadow-slate-950/10 transition duration-200 group-hover:shadow-lg"
          src={book.cover_url}
          alt={`${book.title} 표지`}
        />
        <span>{newBook ? '신간' : book.ai_primary_category}</span>
      </div>
      <div className="book-main">
        <div className="book-card-head">
          <div>
            <span className="category-label">{book.ai_primary_category}</span>
            <h3>{book.title}</h3>
          </div>
        </div>
        <div className="book-badge-row" aria-label="영업 신호">
          {newBook && (
            <span className="badge accent">
              <Sparkles size={13} /> 신간
            </span>
          )}
          {book.is_strategy_book && <span className="badge accent">전략도서</span>}
          {hasDigital && <span className="badge success">디지털 교재</span>}
          {hasMaterials && <span className="badge info">강의자료 있음</span>}
        </div>
        <div className="fit-strip" aria-label="상담 핵심 지표">
          <span>
            <GraduationCap size={15} /> {book.target_grade || '학년 미정'}
          </span>
          <span>{book.difficulty_level || '난이도 미정'}</span>
          <span>
            <FileText size={14} /> {hasMaterials ? '강의자료' : '자료 확인'}
          </span>
          <span>
            <MonitorCheck size={14} /> {hasDigital ? '디지털' : '종이책'}
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
