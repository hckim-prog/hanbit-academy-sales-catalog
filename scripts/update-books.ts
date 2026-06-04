import { readJson, writeJson, type RawBook } from './lib'
import { runCrawl } from './crawl-hanbit-books'

async function main() {
  const before = await readJson<RawBook[]>('data/books_raw.json', [])
  await writeJson('data/books_raw.previous.json', before)
  await runCrawl()
  const after = await readJson<RawBook[]>('data/books_raw.json', [])
  const errors = await readJson<Array<{ url: string }>>('logs/crawl_errors.json', [])
  const beforeById = new Map(before.map((book) => [book.book_id, book]))
  const afterById = new Map(after.map((book) => [book.book_id, book]))

  const newBooks = after.filter((book) => !beforeById.has(book.book_id)).map((book) => book.book_id)
  const removed = before.filter((book) => !afterById.has(book.book_id)).map((book) => book.book_id)
  const changed = after
    .filter((book) => {
      const previous = beforeById.get(book.book_id)
      if (!previous) return false
      return JSON.stringify(signature(previous)) !== JSON.stringify(signature(book))
    })
    .map((book) => book.book_id)

  const reviewRequired = newBooks.concat(changed)

  await writeJson('data/update_report.json', {
    last_updated_at: new Date().toISOString(),
    total_books_before: before.length,
    total_books_after: after.length,
    new_books: newBooks,
    changed_books: changed,
    removed_or_hidden_books: removed,
    reclassified_books: reviewRequired,
    review_required_books: reviewRequired,
    crawl_failed_urls: errors.map((error) => error.url),
    summary: `신규 ${newBooks.length}권, 변경 ${changed.length}권, 삭제 또는 비노출 후보 ${removed.length}권입니다. books_sales_meta.json은 수정하지 않았습니다.`,
  })
  await writeJson('data/books_raw.previous.json', after)
  console.log('[update] report saved. Run npm run classify && npm run merge for changed data.')
}

function signature(book: RawBook) {
  return {
    title: book.title,
    price: book.price,
    pub_date: book.pub_date,
    cover_url: book.cover_url,
    ebook_available: book.ebook_available,
    out_of_stock: book.out_of_stock,
    intro: book.intro,
    toc: book.toc,
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
