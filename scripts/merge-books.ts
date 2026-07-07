import { readJson, writeJson, type ClassifiedBook, type RawBook, type SalesMeta } from './lib'

async function main() {
  const rawBooks = await readJson<RawBook[]>('data/books_raw.json', [])
  const aiBooks = await readJson<ClassifiedBook[]>('data/books_ai_classified.json', [])
  const salesMeta = await readJson<SalesMeta[]>('data/books_sales_meta.json', [])
  const aiById = new Map(aiBooks.map((book) => [book.book_id, book]))
  const salesById = new Map(salesMeta.map((book) => [book.book_id, book]))

  const merged = rawBooks.map((raw) => {
    const ai = aiById.get(raw.book_id)
    const sales = salesById.get(raw.book_id)

    return {
      ...raw,
      ai_primary_category: sales?.internal_note?.includes('분야 override:')
        ? sales.internal_note.replace(/^.*분야 override:\s*/, '').split(/\s/)[0]
        : ai?.ai_primary_category || '교양/기초교육',
      ai_secondary_categories: ai?.ai_secondary_categories || [],
      course_tags: ai?.course_tags || [],
      target_department: ai?.target_department || [],
      target_grade: ai?.target_grade || '',
      difficulty_level: ai?.difficulty_level || raw.difficulty_from_site || '',
      teaching_type: ai?.teaching_type || [],
      sales_keywords: ai?.sales_keywords || [],
      digital_relevance: ai?.digital_relevance || '',
      one_line_summary: ai?.one_line_summary || raw.intro.slice(0, 90),
      confidence: ai?.confidence || 0,
      classification_reason: ai?.classification_reason || '',
      review_required: ai?.review_required ?? true,
      classified_at: ai?.classified_at || '',
      sales_priority: sales?.sales_priority || '',
      is_strategy_book: sales?.is_strategy_book || false,
      is_digital_textbook: sales?.is_digital_textbook ?? raw.ebook_available,
      has_ppt: sales?.has_ppt ?? raw.source_materials.some((item) => item.includes('PPT')),
      has_solution: sales?.has_solution ?? raw.source_materials.some((item) => item.includes('솔루션')),
      has_sample: sales?.has_sample ?? raw.source_materials.some((item) => item.includes('샘플') || item.includes('예제')),
      selling_points: sales?.selling_points || [],
      professor_talk: sales?.professor_talk || '',
      replacement_books: sales?.replacement_books || [],
      internal_note: sales?.internal_note || '',
      mail_text: createEmailSummary(raw),
      reviewed_by: sales?.reviewed_by || '',
      reviewed_at: sales?.reviewed_at || '',
      updated_at: new Date().toISOString(),
    }
  })

  await writeJson('data/books_merged.json', merged)
  await writeJson(
    'data/books_catalog.json',
    merged.map((book) =>
      Object.fromEntries(
        Object.entries(book).filter(([key]) => !['intro', 'toc', 'author_intro'].includes(key)),
      ),
    ),
  )
  await writeJson(
    'data/book_details.json',
    Object.fromEntries(
      merged.map((book) => [book.book_id, { intro: book.intro, toc: book.toc, author_intro: book.author_intro }]),
    ),
  )
  console.log(`[merge] saved ${merged.length} merged books`)
}

function createEmailSummary(book: RawBook) {
  const units = [book.subtitle, ...book.intro.split('\n')]
    .map((value) => value.trim())
    .filter(Boolean)
    .flatMap((value) => {
      const sentences = value.match(/[^.!?。！？]+[.!?。！？]+/g)?.map((sentence) => sentence.trim()) || []
      return sentences.length ? sentences : [value]
    })

  const selected: string[] = []
  for (const unit of units) {
    if (selected.includes(unit)) continue
    if (selected.length && selected.join(' ').length + unit.length + 1 > 220) break
    selected.push(unit)
    if (selected.length === 2 || selected.join(' ').length >= 120) break
  }

  return selected.join(' ')
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
