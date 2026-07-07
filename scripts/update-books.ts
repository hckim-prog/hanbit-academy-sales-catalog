import * as cheerio from 'cheerio'
import { crawlDetail, type BookSeed } from './crawl-hanbit-books'
import { normalizeSpace, readJson, sleep, writeJson, type RawBook } from './lib'

const recentListUrl = 'https://www.hanbit.co.kr/academy/books/full_book_list.html?srt=p_pub_date&brand=HA'
const detailDelayMs = Number(process.env.UPDATE_DETAIL_DELAY_MS || 1500)

async function main() {
  const before = await readJson<RawBook[]>('data/books_raw.json', [])
  const knownUrls = new Set(before.map((book) => book.detail_url))
  const recentSeeds = await fetchRecentSeeds()
  const newSeeds = recentSeeds.filter((seed) => !knownUrls.has(seed.detail_url))

  console.log(`[update] checked=${recentSeeds.length} new=${newSeeds.length}`)
  if (!newSeeds.length) {
    console.log('[update] no new books; existing data and deployment remain unchanged')
    return
  }

  const newBooks: RawBook[] = []
  const failures: Array<{ url: string; reason: string }> = []

  for (const [index, seed] of newSeeds.entries()) {
    try {
      const book = await crawlDetail(seed)
      newBooks.push(book)
      console.log(`[update] ${index + 1}/${newSeeds.length} ${book.title}`)
    } catch (error) {
      failures.push({
        url: seed.detail_url,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
    if (index < newSeeds.length - 1) await sleep(detailDelayMs)
  }

  if (failures.length) {
    await writeJson('logs/crawl_errors.json', failures)
    throw new Error(`신간 ${newSeeds.length}권 중 ${failures.length}권 수집 실패`)
  }

  const after = [...newBooks, ...before]
  await writeJson('data/books_raw.json', after)
  await writeJson('logs/crawl_errors.json', [])
  await writeJson('data/update_report.json', {
    last_updated_at: new Date().toISOString(),
    total_books_before: before.length,
    total_books_after: after.length,
    new_books: newBooks.map((book) => book.book_id),
    changed_books: [],
    removed_or_hidden_books: [],
    reclassified_books: newBooks.map((book) => book.book_id),
    review_required_books: [],
    crawl_failed_urls: [],
    summary: `최신 목록 50권 확인 결과 신규 ${newBooks.length}권을 추가했습니다. 상세 요청은 신규 도서에만 실행했습니다.`,
  })
}

async function fetchRecentSeeds(): Promise<BookSeed[]> {
  const response = await fetch(recentListUrl, {
    headers: { 'user-agent': 'Mozilla/5.0 Hanbit Academy Catalog Daily Updater' },
  })
  if (!response.ok) throw new Error(`최신 도서목록 HTTP ${response.status}`)
  const $ = cheerio.load(await response.text())
  const seeds: BookSeed[] = []

  $('.tbl_type_list tbody tr').each((_, row) => {
    const link = $(row).find('a[href*="book_view.html"]').first()
    const href = link.attr('href')
    if (!href) return
    const cells = $(row).find('td').map((__, cell) => normalizeSpace($(cell).text())).get()
    seeds.push({
      title: normalizeSpace(link.text()) || cells[0] || '',
      authors: splitAuthors(cells[1] || ''),
      pub_date: cells[2] || '',
      price: cells[3] || '',
      detail_url: new URL(href, 'https://www.hanbit.co.kr').toString(),
      source_category: '',
      isbn: '',
      pages: '',
      book_type: '',
      out_of_stock: /품절|절판|비노출/.test(normalizeSpace($(row).text())),
    })
  })

  if (!seeds.length) throw new Error('최신 도서목록에서 도서를 찾지 못했습니다')
  return seeds
}

function splitAuthors(value: string) {
  return value
    .split(/,|·|\/|;|외\s*\d+명/)
    .map((item) => normalizeSpace(item))
    .filter(Boolean)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
