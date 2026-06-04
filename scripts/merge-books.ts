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
      mail_text: sales?.mail_text || ai?.one_line_summary || '',
      reviewed_by: sales?.reviewed_by || '',
      reviewed_at: sales?.reviewed_at || '',
      updated_at: new Date().toISOString(),
    }
  })

  await writeJson('data/books_merged.json', merged)
  console.log(`[merge] saved ${merged.length} merged books`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
