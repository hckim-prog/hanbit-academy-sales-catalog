import * as cheerio from 'cheerio'
import { extractOfficialSection } from './crawl-hanbit-books'
import { readJson, type RawBook } from './lib'

interface Mismatch {
  book_id: string
  title: string
  field: 'intro' | 'toc' | 'author_intro'
}

const concurrency = Number(process.env.VERIFY_CONCURRENCY || 6)
const books = await readJson<RawBook[]>('data/books_raw.json', [])
const queue = [...books]
const mismatches: Mismatch[] = []
const failures: Array<{ book_id: string; title: string; reason: string }> = []

async function verifyBook(book: RawBook) {
  try {
    const response = await fetch(book.detail_url, {
      headers: { 'user-agent': 'Mozilla/5.0 Codex Hanbit Academy Catalog Verifier' },
    })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const $ = cheerio.load(await response.text())
    const official = {
      intro: extractOfficialSection($, '#tabs_1 .detail_conbox'),
      toc: extractOfficialSection($, '#tabs_3 .detail_conbox'),
      author_intro: extractOfficialSection($, '#tabs_2 .detail_conbox'),
    }
    for (const field of ['intro', 'toc', 'author_intro'] as const) {
      if (book[field] !== official[field]) mismatches.push({ book_id: book.book_id, title: book.title, field })
    }
  } catch (error) {
    failures.push({
      book_id: book.book_id,
      title: book.title,
      reason: error instanceof Error ? error.message : String(error),
    })
  }
}

async function worker() {
  while (queue.length) {
    const book = queue.shift()
    if (book) await verifyBook(book)
  }
}

await Promise.all(Array.from({ length: concurrency }, worker))

const duplicateSections = books.filter(
  (book) =>
    (book.intro && book.intro === book.toc) ||
    (book.intro && book.intro === book.author_intro) ||
    (book.toc && book.toc === book.author_intro),
)

console.log(
  JSON.stringify(
    {
      checked_books: books.length,
      checked_fields: books.length * 3,
      mismatches: mismatches.length,
      request_failures: failures.length,
      duplicate_sections: duplicateSections.length,
      mismatch_details: mismatches.slice(0, 20),
      failure_details: failures.slice(0, 20),
    },
    null,
    2,
  ),
)

if (mismatches.length || failures.length || duplicateSections.length) process.exit(1)
