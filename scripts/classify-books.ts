import { readJson, writeJson, type ClassifiedBook, type RawBook } from './lib'

const rules = [
  { category: 'AI/데이터과학', keywords: ['AI', '인공지능', '머신러닝', '딥러닝', '생성형', '데이터과학'] },
  { category: '프로그래밍', keywords: ['프로그래밍', '파이썬', '자바', 'C언어', '코딩', '웹'] },
  { category: '컴퓨터공학', keywords: ['컴퓨터구조', '운영체제', '네트워크', '자료구조', '알고리즘'] },
  { category: '전기/전자/반도체', keywords: ['전기', '전자', '회로', '반도체', '통신'] },
  { category: '통계/데이터분석', keywords: ['통계', '데이터분석', '회귀', '확률', 'R '] },
  { category: '기초수학', keywords: ['미적분', '선형대수', '수학', '공업수학'] },
  { category: '경영/경제', keywords: ['경영', '경제', '마케팅', '회계', '재무'] },
  { category: '논문/연구방법', keywords: ['논문', '연구방법', '조사방법'] },
  { category: '공학일반', keywords: ['공학', '모델링', '설계'] },
]

async function main() {
  const rawBooks = await readJson<RawBook[]>('data/books_raw.json', [])
  const classified = rawBooks.map(classifyBook)
  await writeJson('data/books_ai_classified.json', classified)
  console.log(`[classify] saved ${classified.length} classifications`)
}

function classifyBook(book: RawBook): ClassifiedBook {
  const text = [book.title, book.subtitle, book.intro, book.toc, book.series].join(' ')
  const matches = rules
    .map((rule) => ({
      ...rule,
      score: rule.keywords.reduce((sum, keyword) => sum + (text.includes(keyword) ? 1 : 0), 0),
    }))
    .filter((rule) => rule.score > 0)
    .sort((a, b) => b.score - a.score)

  const primary = matches[0]?.category || '교양/기초교육'
  const confidence = Math.min(0.94, 0.66 + (matches[0]?.score || 0) * 0.08)
  const courseTags = inferCourseTags(text, primary)

  return {
    book_id: book.book_id,
    ai_primary_category: primary,
    ai_secondary_categories: matches.slice(1, 3).map((match) => match.category),
    course_tags: courseTags,
    target_department: inferDepartments(primary),
    target_grade: inferGrade(text),
    difficulty_level: inferDifficulty(book.difficulty_from_site, text),
    teaching_type: text.includes('실습') || text.includes('프로젝트') ? ['실습', '프로젝트'] : ['이론', '문제 풀이'],
    sales_keywords: extractKeywords(text),
    digital_relevance: book.ebook_available ? '전자책과 보조 자료를 함께 안내하기 좋습니다.' : '종이책 중심 채택 상담에 적합합니다.',
    one_line_summary: `${courseTags[0] || primary} 수업에 맞춰 검토할 수 있는 한빛아카데미 교재입니다.`,
    confidence,
    classification_reason: `도서명, 책소개, 목차에서 ${courseTags.slice(0, 3).join(', ')} 관련 신호를 추출했습니다. 사이트 카테고리는 참고용으로만 보관했습니다.`,
    review_required: confidence < 0.85 || matches.length > 2,
    classified_at: new Date().toISOString(),
  }
}

function inferCourseTags(text: string, primary: string) {
  const candidates = [
    '파이썬',
    '프로그래밍 입문',
    '자료구조',
    '알고리즘',
    '운영체제',
    '컴퓨터구조',
    '데이터과학',
    '생성형 AI',
    '기초통계',
    '선형대수',
    '전자회로',
    '반도체공학',
    '경영통계',
    '연구방법론',
    '공학입문',
  ]
  const tags = candidates.filter((tag) => text.includes(tag))
  return tags.length ? tags.slice(0, 5) : [primary]
}

function inferDepartments(category: string) {
  if (category.includes('컴퓨터') || category.includes('프로그래밍') || category.includes('AI')) return ['컴퓨터공학과', '소프트웨어학과']
  if (category.includes('전자')) return ['전자공학과', '반도체공학과']
  if (category.includes('경영')) return ['경영학과', '경제학과']
  if (category.includes('통계')) return ['통계학과', '데이터사이언스학과']
  return ['교양대학', '공과대학']
}

function inferGrade(text: string) {
  if (/입문|기초|처음/.test(text)) return '1-2학년'
  if (/고급|심화/.test(text)) return '3-4학년'
  return '2-3학년'
}

function inferDifficulty(siteDifficulty: string, text: string) {
  if (siteDifficulty) return siteDifficulty
  if (/입문|처음/.test(text)) return '입문'
  if (/고급|심화/.test(text)) return '고급'
  if (/기초|초급/.test(text)) return '초급'
  return '중급'
}

function extractKeywords(text: string) {
  return Array.from(new Set(text.match(/[A-Za-z가-힣]{2,}/g) || [])).slice(0, 8)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
