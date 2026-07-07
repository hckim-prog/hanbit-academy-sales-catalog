import type { Book, CatalogFilters, SortKey } from '../types/book'
import { isNewBook } from './utils'

const salesPriorityWeight = { A: 3, B: 2, C: 1, '': 0 }

const queryAliases: Record<string, string[]> = {
  ai: ['인공지능', '머신러닝', '딥러닝', '생성형'],
  인공지능: ['ai', '머신러닝', '딥러닝'],
  전산: ['컴퓨터공학', '프로그래밍', '소프트웨어'],
  컴퓨터공학: ['전산', '프로그래밍', '소프트웨어', '운영체제', '자료구조'],
  파이썬: ['python', '프로그래밍 입문', '코딩'],
  반도체: ['전자', '회로', '공정'],
  통계: ['데이터분석', '확률', '빅데이터'],
  경영: ['경제', '회계', '마케팅'],
}

function compact(value = '') {
  return value.toLocaleLowerCase('ko-KR').replace(/[·/,&()-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function queryTerms(query: string) {
  const base = compact(query)
    .split(' ')
    .map((term) => term.endsWith('학과') ? term.slice(0, -1) : term)
    .filter((term) => term.length > 1)
  const direct = base.map((term) => ({ term, weight: 1 }))
  const aliases = base.flatMap((term) => (queryAliases[term] ?? []).map((alias) => ({ term: alias, weight: 0.22 })))
  return [...direct, ...aliases]
}

export function rankBooks(books: Book[], query: string) {
  const terms = queryTerms(query)
  if (!terms.length) return sortBooks(books, 'newest')

  return books
    .map((book) => {
      const fields = [
        [compact(book.title), 12],
        [compact(book.subtitle), 8],
        [compact(book.course_tags.join(' ')), 10],
        [compact(book.ai_primary_category), 9],
        [compact(book.ai_secondary_categories.join(' ')), 7],
        [compact(book.target_department.join(' ')), 7],
        [compact(book.sales_keywords.join(' ')), 6],
        [compact(book.one_line_summary), 5],
        [compact(book.authors.join(' ')), 5],
        [compact(`${book.isbn} ${book.eisbn}`), 12],
        [compact(book.intro), 2],
      ] as const
      const score = terms.reduce(
        (total, queryTerm) => total + fields.reduce((sum, [field, fieldWeight]) => sum + (field.includes(queryTerm.term) ? fieldWeight * queryTerm.weight : 0), 0),
        0,
      ) + salesPriorityWeight[book.sales_priority]
      return { book, score }
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || dateValue(b.book.pub_date) - dateValue(a.book.pub_date))
    .map(({ book }) => book)
}

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
