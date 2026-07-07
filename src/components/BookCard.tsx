import { BookPlus, Check, ChevronRight } from 'lucide-react'
import type { Book } from '../types/book'
import { formatDate } from '../lib/utils'

interface BookCardProps { book: Book; selected: boolean; onOpen: () => void; onToggleSelected: () => void }

export function BookCard({ book, selected, onOpen, onToggleSelected }: BookCardProps) {
  return (
    <article className="simple-book-card">
      <button type="button" className="book-open-area" onClick={onOpen} aria-label={`${book.title} 상세보기`}>
        <img src={book.cover_url} alt={`${book.title} 표지`} loading="lazy" decoding="async" />
        <div className="book-card-copy">
          <span className="category-label">{book.ai_primary_category}</span>
          <h3>{book.title}</h3>
          {book.subtitle && <p className="official-subtitle">{book.subtitle}</p>}
          <p className="book-meta">{book.authors.join(', ')}</p>
          <p className="book-meta">{formatDate(book.pub_date)} · ISBN {book.isbn}</p>
          <span className="detail-link">도서정보 보기 <ChevronRight size={16} /></span>
        </div>
      </button>
      <button type="button" className={selected ? 'save-book active' : 'save-book'} onClick={onToggleSelected} aria-pressed={selected}>
        {selected ? <Check size={17} /> : <BookPlus size={17} />}{selected ? '관심 도서에 담김' : '관심 도서 담기'}
      </button>
    </article>
  )
}
