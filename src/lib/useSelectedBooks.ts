import { useMemo, useState } from 'react'
import type { Book } from '../types/book'

const storageKey = 'hanbit-academy-selected-books'

export function useSelectedBooks(books: Book[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey) || '[]') as string[]
    } catch {
      return []
    }
  })

  const persist = (nextIds: string[]) => {
    setSelectedIds(nextIds)
    localStorage.setItem(storageKey, JSON.stringify(nextIds))
  }

  const selectedBooks = useMemo(
    () => selectedIds.map((id) => books.find((book) => book.book_id === id)).filter(Boolean) as Book[],
    [books, selectedIds],
  )

  return {
    selectedBooks,
    isSelected: (bookId: string) => selectedIds.includes(bookId),
    toggleBook: (bookId: string) => {
      persist(
        selectedIds.includes(bookId)
          ? selectedIds.filter((id) => id !== bookId)
          : [...selectedIds, bookId],
      )
    },
    removeBook: (bookId: string) => persist(selectedIds.filter((id) => id !== bookId)),
    clearBooks: () => persist([]),
  }
}
