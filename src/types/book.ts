export type AiPrimaryCategory =
  | '경영/경제'
  | '경영경제수학/통계'
  | '기초수학'
  | '통계/데이터분석'
  | '컴퓨터공학'
  | '프로그래밍'
  | 'AI/데이터과학'
  | '전기/전자/반도체'
  | '공학일반'
  | '논문/연구방법'
  | '교양/기초교육'

export type DifficultyLevel = '입문' | '초급' | '중급' | '고급'
export type SalesPriority = 'A' | 'B' | 'C' | ''
export type SortKey =
  | 'newest'
  | 'title'
  | 'category'
  | 'salesPriority'
  | 'lowConfidence'
  | 'updated'

export interface Book {
  book_id: string
  title: string
  subtitle: string
  authors: string[]
  price: string
  pub_date: string
  detail_url: string
  source_category: string
  cover_url: string
  isbn: string
  eisbn: string
  pages: string
  logistics_code: string
  book_type: string
  ebook_available: boolean
  rental_available: boolean
  difficulty_from_site: string
  intro: string
  toc: string
  author_intro: string
  series: string
  source_materials: string[]
  out_of_stock: boolean
  crawled_at: string
  ai_primary_category: AiPrimaryCategory
  ai_secondary_categories: string[]
  course_tags: string[]
  target_department: string[]
  target_grade: string
  difficulty_level: DifficultyLevel
  teaching_type: string[]
  sales_keywords: string[]
  digital_relevance: string
  one_line_summary: string
  confidence: number
  classification_reason: string
  review_required: boolean
  classified_at: string
  sales_priority: SalesPriority
  is_strategy_book: boolean
  is_digital_textbook: boolean
  has_ppt: boolean
  has_solution: boolean
  has_sample: boolean
  selling_points: string[]
  professor_talk: string
  replacement_books: string[]
  internal_note: string
  mail_text: string
  reviewed_by: string
  reviewed_at: string
  updated_at: string
}

export interface UpdateReport {
  last_updated_at: string
  total_books_before: number
  total_books_after: number
  new_books: string[]
  changed_books: string[]
  removed_or_hidden_books: string[]
  reclassified_books: string[]
  review_required_books: string[]
  crawl_failed_urls: string[]
  summary: string
}

export interface CatalogFilters {
  query: string
  category: string
  courseTag: string
  flags: {
    strategy: boolean
    digital: boolean
    materials: boolean
    review: boolean
    newOnly: boolean
  }
}
