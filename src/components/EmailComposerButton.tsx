import { Mail } from 'lucide-react'
import { buildGmailComposeUrl } from '../lib/email'
import type { Book } from '../types/book'

export function EmailComposerButton({ books }: { books: Book[] }) {
  const disabled = books.length === 0

  return (
    <a
      className={disabled ? 'primary-action disabled' : 'primary-action'}
      href={disabled ? undefined : buildGmailComposeUrl(books)}
      target="_blank"
      rel="noreferrer"
      aria-disabled={disabled}
    >
      <Mail size={18} />
      Gmail 작성창 열기
    </a>
  )
}
