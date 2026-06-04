import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export interface RawBook {
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
}

export interface ClassifiedBook {
  book_id: string
  ai_primary_category: string
  ai_secondary_categories: string[]
  course_tags: string[]
  target_department: string[]
  target_grade: string
  difficulty_level: string
  teaching_type: string[]
  sales_keywords: string[]
  digital_relevance: string
  one_line_summary: string
  confidence: number
  classification_reason: string
  review_required: boolean
  classified_at: string
}

export interface SalesMeta {
  book_id: string
  sales_priority?: string
  is_strategy_book?: boolean
  is_digital_textbook?: boolean
  has_ppt?: boolean
  has_solution?: boolean
  has_sample?: boolean
  selling_points?: string[]
  professor_talk?: string
  replacement_books?: string[]
  internal_note?: string
  mail_text?: string
  reviewed_by?: string
  reviewed_at?: string
}

export async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, 'utf8')) as T
  } catch {
    return fallback
  }
}

export async function writeJson(path: string, value: unknown) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function normalizeSpace(value: string) {
  return value.replace(/\s+/g, ' ').trim()
}

export function makeBookId(detailUrl: string, title = '') {
  const code = new URL(detailUrl).searchParams.get('p_code')
  if (code) return code
  return title
    .toLowerCase()
    .replace(/[^a-z0-9가-힣]+/gi, '-')
    .replace(/^-|-$/g, '')
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
