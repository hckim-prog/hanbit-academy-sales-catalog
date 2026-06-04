import * as Dialog from '@radix-ui/react-dialog'
import { Trash2, X } from 'lucide-react'
import type { Book } from '../types/book'
import { EmailComposerButton } from './EmailComposerButton'

interface SelectedBooksSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  books: Book[]
  onRemove: (bookId: string) => void
  onClear: () => void
}

export function SelectedBooksSheet({ open, onOpenChange, books, onRemove, onClear }: SelectedBooksSheetProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="sheet-content">
          <div className="dialog-title-row">
            <div>
              <Dialog.Title>관심 도서</Dialog.Title>
              <Dialog.Description>교수님께 보낼 교재 후보를 정리합니다.</Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="닫기">
              <X size={19} />
            </Dialog.Close>
          </div>
          <div className="selected-list">
            {books.map((book) => (
              <article key={book.book_id} className="selected-item">
                <img src={book.cover_url} alt="" />
                <div>
                  <strong>{book.title}</strong>
                  <span>{book.course_tags.slice(0, 2).join(', ')}</span>
                </div>
                <button type="button" className="icon-button" onClick={() => onRemove(book.book_id)} aria-label="삭제">
                  <Trash2 size={17} />
                </button>
              </article>
            ))}
            {!books.length && <p className="muted">아직 담은 도서가 없습니다.</p>}
          </div>
          <div className="sheet-actions">
            <EmailComposerButton books={books} />
            <button type="button" className="secondary-action wide" onClick={onClear} disabled={!books.length}>
              전체 비우기
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
