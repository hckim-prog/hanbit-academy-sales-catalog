import { pathToFileURL } from 'node:url'
import { readJson, writeJson, type ClassifiedBook, type RawBook } from './lib'

type CategoryRule = { category: string; terms: string[]; sourceTerms: string[] }

const rules: CategoryRule[] = [
  {
    category: '컴퓨터공학',
    terms: ['컴퓨터 구조', '컴퓨터구조', '컴퓨터 아키텍처', '운영체제', '컴퓨터 네트워크', '데이터 통신', '자료구조', '알고리즘', '컴파일러', '리눅스', '임베디드 시스템', '마이크로프로세서'],
    sourceTerms: ['컴퓨터공학', '컴퓨터'],
  },
  {
    category: '프로그래밍',
    terms: ['프로그래밍', '파이썬', 'python', '자바', 'java', 'c언어', 'c++', 'c#', '코딩', '웹 프로그래밍', '안드로이드', '유니티', '소프트웨어 개발'],
    sourceTerms: ['프로그래밍', '소프트웨어'],
  },
  {
    category: 'AI/데이터과학',
    terms: ['ai', '인공지능', '머신러닝', '기계학습', '딥러닝', '생성형 ai', '데이터 과학', '데이터과학', '자연어 처리', '컴퓨터 비전', '강화학습', '신경망'],
    sourceTerms: ['인공지능', '데이터과학'],
  },
  {
    category: '전기/전자/반도체',
    terms: ['전기회로', '전자회로', '회로이론', '반도체', '전자기학', '전력전자', '신호 및 시스템', '신호처리', '통신이론', '제어공학', '칼만 필터', '디지털 논리회로', '논리회로', '마이크로컨트롤러', 'plc'],
    sourceTerms: ['전기', '전자', '반도체', '통신'],
  },
  {
    category: '통계/데이터분석',
    terms: ['통계학', '통계 분석', '통계분석', '데이터 분석', '데이터분석', '회귀분석', '확률과 통계', '빅데이터 분석', 'spss', 'amos', 'stata', 'r 통계'],
    sourceTerms: ['통계', '데이터분석'],
  },
  {
    category: '기초수학',
    terms: ['미분적분학', '미적분학', '미분방정식', '선형대수', '이산수학', '공업수학', '공학수학', '수치해석', '대학수학', '기초수학', '현대대수학'],
    sourceTerms: ['수학'],
  },
  {
    category: '경영/경제',
    terms: ['경영학', '경제학', '마케팅', '회계원리', '재무회계', '재무관리', '경영정보시스템', '무역', '창업', '인적자원관리', '비즈니스', 'esg'],
    sourceTerms: ['경영', '경제', '회계', '무역'],
  },
  {
    category: '논문/연구방법',
    terms: ['논문 작성', '논문작성', '연구방법론', '연구 방법', '조사방법론', '메타분석', '구조방정식'],
    sourceTerms: ['논문', '연구방법'],
  },
  {
    category: '공학일반',
    terms: ['열역학', '유체역학', '정역학', '동역학', '재료역학', '기계공학', '공학설계', '기계설계', '기계공작'],
    sourceTerms: ['공학', '기계'],
  },
  {
    category: '교양/기초교육',
    terms: ['컴퓨팅 사고', '정보 윤리', '디자인 씽킹', '대학 글쓰기', '프레젠테이션', '엑셀', '파워포인트', '한글 20', '포토샵', '일러스트레이터'],
    sourceTerms: ['교양', '기초교육'],
  },
]

const fieldWeights = [
  ['title', 45],
  ['subtitle', 30],
  ['toc', 20],
  ['intro', 10],
  ['series', 5],
] as const

export function classifyBook(book: RawBook): ClassifiedBook {
  const scored = rules
    .map((rule) => {
      const evidence: string[] = []
      let score = 0

      for (const [field, weight] of fieldWeights) {
        const matched = rule.terms.filter((term) => hasTerm(book[field], term))
        if (!matched.length) continue
        score += weight * (1 + Math.min(matched.length - 1, 2) * 0.15)
        evidence.push(`${field}:${matched.slice(0, 3).join(',')}`)
      }

      const sourceMatched = rule.sourceTerms.some((term) => hasTerm(book.source_category, term))
      if (sourceMatched) {
        score += 5
        evidence.push(`source:${book.source_category}`)
      }

      return { ...rule, score, evidence }
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)

  const first = scored[0]
  const second = scored[1]
  const primary = first?.category || sourceFallback(book.source_category) || '교양/기초교육'
  const margin = (first?.score ?? 0) - (second?.score ?? 0)
  const confidence = Number(Math.min(0.98, 0.58 + Math.min(first?.score ?? 0, 100) / 250 + Math.min(margin, 30) / 150).toFixed(2))
  const fullText = [book.title, book.subtitle, book.intro, book.toc, book.series].join(' ')
  const courseTags = inferCourseTags(fullText, primary)

  return {
    book_id: book.book_id,
    ai_primary_category: primary,
    ai_secondary_categories: scored.slice(1, 3).filter((result) => result.score >= 15).map((result) => result.category),
    course_tags: courseTags,
    target_department: [],
    target_grade: '',
    difficulty_level: book.difficulty_from_site || '',
    teaching_type: [],
    sales_keywords: courseTags,
    digital_relevance: '',
    one_line_summary: '',
    confidence,
    classification_reason: first
      ? `서지정보 가중치 분류 ${first.score.toFixed(1)}점 (${first.evidence.join(' / ')}). 공식 카테고리는 5점 보정값으로만 사용했습니다.`
      : `서지정보 근거가 부족하여 공식 카테고리를 후순위 기준으로 사용했습니다.`,
    review_required: !first || first.score < 35 || margin < 12,
    classified_at: new Date().toISOString(),
  }
}

function hasTerm(value: string, term: string) {
  const normalizedValue = normalize(value)
  const normalizedTerm = normalize(term)
  if (!normalizedValue || !normalizedTerm) return false

  if (/^[a-z0-9+#.]{1,3}$/i.test(normalizedTerm)) {
    const escaped = normalizedTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    return new RegExp(`(^|[^a-z0-9])${escaped}($|[^a-z0-9])`, 'i').test(normalizedValue)
  }

  return normalizedValue.includes(normalizedTerm) || compact(normalizedValue).includes(compact(normalizedTerm))
}

function normalize(value = '') {
  return value.toLocaleLowerCase('ko-KR').replace(/[·/,&()_:;-]/g, ' ').replace(/\s+/g, ' ').trim()
}

function compact(value: string) {
  return value.replace(/\s+/g, '')
}

function sourceFallback(source: string) {
  return rules.find((rule) => rule.sourceTerms.some((term) => hasTerm(source, term)))?.category
}

function inferCourseTags(text: string, primary: string) {
  const candidates = [
    '컴퓨터 구조', '운영체제', '컴퓨터 네트워크', '자료구조', '알고리즘', '파이썬', '프로그래밍 입문',
    '인공지능', '머신러닝', '딥러닝', '데이터 과학', '통계 분석', '선형대수', '미분적분학',
    '전자회로', '반도체', '제어공학', '회계원리', '경제학', '논문 작성', '유체역학',
  ]
  const tags = candidates.filter((term) => hasTerm(text, term))
  return tags.length ? tags.slice(0, 6) : [primary]
}

async function main() {
  const rawBooks = await readJson<RawBook[]>('data/books_raw.json', [])
  const classified = rawBooks.map(classifyBook)
  await writeJson('data/books_ai_classified.json', classified)
  console.log(`[classify] saved ${classified.length} classifications`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exit(1)
  })
}
