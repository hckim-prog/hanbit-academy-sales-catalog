import type { Book, CatalogFilters, SortKey } from '../types/book'
import { isNewBook } from './utils'

const salesPriorityWeight = { A: 3, B: 2, C: 1, '': 0 }

export function getCatalogFacets(books: Book[]) {
  return {
    categories: ['전체', ...Array.from(new Set(books.map((book) => book.ai_primary_category)))],
    courseTags: ['전체', ...Array.from(new Set(books.flatMap((book) => book.course_tags))).slice(0, 18)],
  }
}

export function filterBooks(books: Book[], filters: CatalogFilters) {
  const query = filters.query.trim().toLowerCase()

  return books.filter((book) => {
    const searchable = [
      book.title,
      book.subtitle,
      book.authors.join(' '),
      book.isbn,
      book.eisbn,
      book.ai_primary_category,
      book.ai_secondary_categories.join(' '),
      book.course_tags.join(' '),
      book.sales_keywords.join(' '),
      book.intro,
      book.toc,
      book.internal_note,
    ]
      .join(' ')
      .toLowerCase()

    if (query && !searchable.includes(query)) return false
    if (filters.category !== '전체' && book.ai_primary_category !== filters.category) return false
    if (filters.courseTag !== '전체' && !book.course_tags.includes(filters.courseTag)) return false
    if (filters.difficulty !== '전체' && book.difficulty_level !== filters.difficulty) return false
    if (filters.flags.strategy && !book.is_strategy_book) return false
    if (filters.flags.digital && !(book.is_digital_textbook || book.ebook_available)) return false
    if (filters.flags.materials && !(book.has_ppt || book.has_solution || book.has_sample)) return false
    if (filters.flags.review && !book.review_required) return false
    if (filters.flags.newOnly && !isNewBook(book.pub_date)) return false
    return true
  })
}

export function sortBooks(books: Book[], sortKey: SortKey) {
  return [...books].sort((a, b) => {
    if (sortKey === 'title') return a.title.localeCompare(b.title, 'ko-KR')
    if (sortKey === 'category') return a.ai_primary_category.localeCompare(b.ai_primary_category, 'ko-KR')
    if (sortKey === 'salesPriority') {
      return salesPriorityWeight[b.sales_priority] - salesPriorityWeight[a.sales_priority]
    }
    if (sortKey === 'updated') return dateValue(b.updated_at) - dateValue(a.updated_at)
    return dateValue(b.pub_date) - dateValue(a.pub_date)
  })
}

function dateValue(value: string) {
  return value ? new Date(value).getTime() : 0
}
