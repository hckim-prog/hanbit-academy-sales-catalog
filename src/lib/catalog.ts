import type { Book, CatalogFilters, SortKey } from '../types/book'

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
