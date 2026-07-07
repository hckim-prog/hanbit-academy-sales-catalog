import * as cheerio from 'cheerio'
import { pathToFileURL } from 'node:url'
import { makeBookId, normalizeSpace, readJson, sleep, writeJson, type RawBook } from './lib'

const baseUrl = 'https://www.hanbit.co.kr'
const fullListUrl = 'https://www.hanbit.co.kr/academy/books/full_book_list.html'
const downloadUrl = 'https://www.hanbit.co.kr/academy/books/full_book_list_down.php'
const requestDelayMs = Number(process.env.CRAWL_DELAY_MS || 650)
const maxListPages = Number(process.env.CRAWL_MAX_LIST_PAGES || 200)

interface CrawlOptions {
  limit?: number
  mode?: 'test' | 'all'
}

interface CrawlError {
  url: string
  reason: string
}

export interface BookSeed {
  title: string
  authors: string[]
  price: string
  pub_date: string
  detail_url: string
  source_category: string
  isbn: string
  pages: string
  book_type: string
  out_of_stock: boolean
}

export async function runCrawl(options: CrawlOptions = {}) {
  const before = await readJson<RawBook[]>('data/books_raw.json', [])
  const errors: CrawlError[] = []
  const downloadSeeds = await collectDownloadSeeds(errors)
  const listSeeds = await collectPaginatedSeeds(errors)
  const seeds = mergeSeeds(listSeeds, downloadSeeds)
  const limitedSeeds = seeds.slice(0, options.limit || undefined)
  const books: RawBook[] = []

  console.log(
    `[crawl] mode=${options.mode || 'all'} list=${listSeeds.length} download=${downloadSeeds.length} detailTargets=${limitedSeeds.length}`,
  )

  for (const [index, seed] of limitedSeeds.entries()) {
    try {
      const book = await crawlDetail(seed)
      books.push(book)
      console.log(`[crawl] ${index + 1}/${limitedSeeds.length} ${book.title}`)
    } catch (error) {
      errors.push({
        url: seed.detail_url,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
    await sleep(requestDelayMs)
  }

  const byUrl = new Map<string, RawBook>()
  for (const book of books) byUrl.set(book.detail_url, book)
  const rawBooks = Array.from(byUrl.values())

  await writeJson('data/books_raw.json', rawBooks)
  await writeJson('logs/crawl_errors.json', errors)
  await writeUpdateReport(before, rawBooks, errors)

  const newCount = countNewBooks(before, rawBooks)
  console.log(
    `[crawl] saved=${rawBooks.length} new=${newCount} failed=${errors.length} report=data/update_report.json`,
  )
}

async function collectDownloadSeeds(errors: CrawlError[]) {
  try {
    const html = await fetchText(downloadUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      body: 'brand=HA&srt=p_pub_date',
    })
    const $ = cheerio.load(html)
    const seeds: BookSeed[] = []

    $('tbody tr').each((_, row) => {
      const cells = $(row)
        .find('td')
        .map((__, cell) => normalizeSpace($(cell).text()))
        .get()
      if (cells.length < 14) return
      seeds.push({
        title: cells[3],
        authors: splitAuthors(cells[8]),
        price: cells[7] ? `${cells[7]}원` : '',
        pub_date: cells[5],
        detail_url: '',
        source_category: [cells[11], cells[12]].filter(Boolean).join(' > '),
        isbn: cells[2].replace(/[^0-9X]/gi, ''),
        pages: cells[6] ? `${cells[6]}쪽` : '',
        book_type: cells[4],
        out_of_stock: /품절|절판|비노출/.test(cells[13]),
      })
    })

    return seeds.filter((seed) => seed.title)
  } catch (error) {
    errors.push({
      url: downloadUrl,
      reason: `download source failed: ${error instanceof Error ? error.message : String(error)}`,
    })
    return []
  }
}

async function collectPaginatedSeeds(errors: CrawlError[]) {
  const seeds: BookSeed[] = []
  const queue = [fullListUrl]
  const visited = new Set<string>()

  while (queue.length && visited.size < maxListPages) {
    const pageUrl = queue.shift()
    if (!pageUrl || visited.has(pageUrl)) continue
    visited.add(pageUrl)

    try {
      const html = await fetchText(pageUrl)
      const $ = cheerio.load(html)

      $('.tbl_type_list tbody tr').each((_, row) => {
        const link = $(row).find('a[href*="book_view.html"]').first()
        const href = link.attr('href')
        if (!href) return
        const cells = $(row)
          .find('td')
          .map((__, cell) => normalizeSpace($(cell).text()))
          .get()
        seeds.push({
          title: normalizeSpace(link.text()) || cells[0],
          authors: splitAuthors(cells[1] || ''),
          pub_date: cells[2] || '',
          price: cells[3] || '',
          detail_url: toAbsoluteUrl(href),
          source_category: '',
          isbn: '',
          pages: '',
          book_type: '',
          out_of_stock: /품절|절판|비노출/.test(normalizeSpace($(row).text())),
        })
      })

      $('a[href*="full_book_list.html"]').each((_, element) => {
        const href = $(element).attr('href')
        if (!href) return
        const nextUrl = normalizeListUrl(toAbsoluteUrl(href))
        if (!visited.has(nextUrl) && !queue.includes(nextUrl)) queue.push(nextUrl)
      })

      await sleep(requestDelayMs)
    } catch (error) {
      errors.push({
        url: pageUrl,
        reason: error instanceof Error ? error.message : String(error),
      })
    }
  }

  return dedupeSeeds(seeds)
}

function mergeSeeds(listSeeds: BookSeed[], downloadSeeds: BookSeed[]) {
  const downloadByTitleDate = new Map(downloadSeeds.map((seed) => [seedKey(seed), seed]))
  const merged = listSeeds.map((seed) => {
    const download = downloadByTitleDate.get(seedKey(seed))
    return {
      ...seed,
      authors: seed.authors.length ? seed.authors : download?.authors || [],
      price: seed.price || download?.price || '',
      pub_date: seed.pub_date || download?.pub_date || '',
      source_category: download?.source_category || seed.source_category,
      isbn: download?.isbn || seed.isbn,
      pages: download?.pages || seed.pages,
      book_type: download?.book_type || seed.book_type,
      out_of_stock: seed.out_of_stock || download?.out_of_stock || false,
    }
  })

  return dedupeSeeds(merged)
}

export async function crawlDetail(seed: BookSeed): Promise<RawBook> {
  const html = await fetchText(seed.detail_url)
  const $ = cheerio.load(html)
  const pageText = normalizeSpace($('body').text())
  const title =
    normalizeSpace($('.store_product_info_box h3').first().text()) ||
    normalizeSpace($('h3').first().text()) ||
    seed.title
  const subtitle = normalizeSpace($('.store_product_info_box .book_subtitle, .store_product_info_box .sub_tit').first().text())
  const cover = findCoverUrl($, title)
  const infoItems = extractInfoItems($)

  return {
    book_id: makeBookId(seed.detail_url, title),
    title,
    subtitle,
    authors: splitAuthors(infoItems['저자'] || infoItems['역자'] || '').length
      ? splitAuthors(infoItems['저자'] || infoItems['역자'] || '')
      : seed.authors,
    price: normalizePrice(infoItems['정가'] || seed.price || extractWon(pageText)),
    pub_date: normalizeDate(infoItems['출간'] || infoItems['출간일'] || seed.pub_date),
    detail_url: seed.detail_url,
    source_category: seed.source_category,
    cover_url: cover,
    isbn: (infoItems['ISBN'] || seed.isbn || extractIsbn(pageText, false)).replace(/-/g, ''),
    eisbn: (infoItems['eISBN'] || extractIsbn(pageText, true)).replace(/-/g, ''),
    pages: infoItems['페이지'] || infoItems['쪽수'] || seed.pages || extractPages(pageText),
    logistics_code: infoItems['물류코드'] || new URL(seed.detail_url).searchParams.get('p_code') || '',
    book_type: seed.book_type || inferBookType(pageText),
    ebook_available: /전자책|eBook|ebook/i.test(pageText),
    rental_available: /대여 가능|대여/.test(pageText),
    difficulty_from_site: extractDifficulty($),
    intro: extractOfficialSection($, '#tabs_1 .detail_conbox'),
    toc: extractOfficialSection($, '#tabs_3 .detail_conbox'),
    author_intro: extractOfficialSection($, '#tabs_2 .detail_conbox'),
    series: extractSeries($, pageText),
    source_materials: inferMaterials(pageText),
    out_of_stock: seed.out_of_stock || /품절|절판|구매불가/.test(pageText),
    crawled_at: new Date().toISOString(),
  }
}

async function writeUpdateReport(before: RawBook[], after: RawBook[], errors: CrawlError[]) {
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
    summary: `전체도서목록 기준 수집 결과: 총 ${after.length}권, 신규 ${newBooks.length}권, 변경 ${changed.length}권, 실패 ${errors.length}건입니다. books_sales_meta.json은 수정하지 않았습니다.`,
  })
}

async function fetchText(url: string, init: RequestInit = {}) {
  const response = await fetch(url, {
    ...init,
    headers: {
      'user-agent': 'Mozilla/5.0 Codex Hanbit Academy Sales Catalog',
      ...init.headers,
    },
  })
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  return response.text()
}

function toAbsoluteUrl(href: string) {
  return new URL(href, baseUrl).toString()
}

function normalizeListUrl(url: string) {
  const parsed = new URL(url)
  parsed.hash = ''
  if (!parsed.searchParams.has('srt')) parsed.searchParams.set('srt', 'p_pub_date')
  if (!parsed.searchParams.has('brand')) parsed.searchParams.set('brand', 'HA')
  return parsed.toString()
}

function findCoverUrl($: cheerio.CheerioAPI, title: string) {
  const candidates = [
    $('.store_product_box_img img.thumb').first().attr('src'),
    $('.store_product_box_img img').first().attr('src'),
    $('meta[property="og:image"]').attr('content'),
    $('meta[name="twitter:image"]').attr('content'),
    $('img.thumb').first().attr('src'),
    $('img')
      .filter((_, img) => {
        const src = $(img).attr('src') || ''
        const alt = $(img).attr('alt') || ''
        return (
          /cdn-prod\.hanbit\.co\.kr\/books|\/books\/.+\.(png|jpg|jpeg|webp)$/i.test(src) ||
          Boolean(title && alt.includes(title.slice(0, 8)))
        )
      })
      .first()
      .attr('src'),
  ].filter(Boolean) as string[]
  const cover = candidates.find((src) => !/icon|logo|author|barcode|editor/i.test(src))
  return cover ? toAbsoluteUrl(cover) : ''
}

function extractInfoItems($: cheerio.CheerioAPI) {
  const items: Record<string, string> = {}
  $('.store_product_info_box .info_list li').each((_, element) => {
    const key = normalizeSpace($(element).find('strong').first().text())
    const value = normalizeSpace($(element).find('span').first().text())
    if (key && value) items[key] = value
  })
  return items
}

function extractDifficulty($: cheerio.CheerioAPI) {
  return normalizeSpace($('.store_product_info_box .level .step_level').first().text())
}

function normalizePrice(value: string) {
  const clean = normalizeSpace(value)
  if (!clean) return ''
  return clean.endsWith('원') ? clean : `${clean}원`
}

function extractSeries($: cheerio.CheerioAPI, pageText: string) {
  return normalizeSpace($('.series_name, .book_series').first().text()) || extractMeta(pageText, '시리즈')
}

function inferBookType(text: string) {
  return [
    text.includes('종이책') && '종이책',
    /전자책|eBook|ebook/i.test(text) && '전자책',
  ]
    .filter(Boolean)
    .join(', ')
}

function extractMeta(text: string, label: string) {
  const match = text.match(new RegExp(`${label}\\s*[:：]?\\s*([^|\\n]{1,80})`))
  return normalizeSpace(match?.[1] || '')
}

function splitAuthors(value: string) {
  return value
    .split(/,|·|\/|;|외\s*\d+명/)
    .map((item) => normalizeSpace(item))
    .filter(Boolean)
}

function extractWon(text: string) {
  return text.match(/\d{1,3}(,\d{3})*원/)?.[0] || ''
}

function extractPages(text: string) {
  return text.match(/\d+\s*쪽/)?.[0] || ''
}

function extractIsbn(text: string, electronic: boolean) {
  const pattern = electronic ? /eISBN\s*[:：]?\s*([0-9-]{10,20})/i : /ISBN\s*[:：]?\s*([0-9-]{10,20})/i
  return (text.match(pattern)?.[1] || '').replace(/-/g, '')
}

function normalizeDate(value: string) {
  const match = value.match(/(20\d{2})[.-]\s*(\d{1,2})[.-]\s*(\d{1,2})/)
  if (!match) return value
  return `${match[1]}-${match[2].padStart(2, '0')}-${match[3].padStart(2, '0')}`
}

export function extractOfficialSection($: cheerio.CheerioAPI, selector: string) {
  const section = $(selector).first().clone()
  if (!section.length) return ''
  section.find('script, style, noscript').remove()
  section.find('br').replaceWith('\n')
  section.find('p, div, li, tr, h1, h2, h3, h4, h5').each((_, element) => {
    $(element).append('\n')
  })
  return section
    .text()
    .split('\n')
    .map((line) => normalizeSpace(line))
    .filter(Boolean)
    .join('\n')
}

function inferMaterials(text: string) {
  return [
    /PPT|강의자료/.test(text) && '강의 PPT',
    /소스|예제/.test(text) && '예제 소스',
    /솔루션|해답/.test(text) && '솔루션',
    /샘플/.test(text) && '샘플 자료',
  ].filter(Boolean) as string[]
}

function dedupeSeeds(seeds: BookSeed[]) {
  const byUrl = new Map<string, BookSeed>()
  for (const seed of seeds) {
    const key = seed.detail_url || seedKey(seed)
    if (!byUrl.has(key)) byUrl.set(key, seed)
  }
  return Array.from(byUrl.values())
}

function seedKey(seed: Pick<BookSeed, 'title' | 'pub_date'>) {
  return `${normalizeSpace(seed.title).replace(/\s+/g, '')}::${seed.pub_date}`
}

function countNewBooks(before: RawBook[], after: RawBook[]) {
  const beforeIds = new Set(before.map((book) => book.book_id))
  return after.filter((book) => !beforeIds.has(book.book_id)).length
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

function parseArgs(): CrawlOptions {
  const limitArg = process.argv.find((arg) => arg.startsWith('--limit='))
  const inlineLimit = limitArg ? Number(limitArg.split('=')[1]) : 0
  const spacedLimitIndex = process.argv.indexOf('--limit')
  const spacedLimit = spacedLimitIndex >= 0 ? Number(process.argv[spacedLimitIndex + 1]) : 0
  const modeIndex = process.argv.indexOf('--mode')
  const mode = modeIndex >= 0 && process.argv[modeIndex + 1] === 'test' ? 'test' : 'all'
  const envLimit = Number(process.env.CRAWL_LIMIT || 0)
  return {
    mode,
    limit: inlineLimit || spacedLimit || envLimit || undefined,
  }
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  runCrawl(parseArgs()).catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
