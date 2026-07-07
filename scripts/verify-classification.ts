import { readJson, type ClassifiedBook, type RawBook } from './lib'

const expectations: Array<[string, string]> = [
  ['IT CookBook, 최신 컴퓨터 구조(2판)', '컴퓨터공학'],
  ['IT CookBook, 쉽게 배우는 운영체제(3판)', '컴퓨터공학'],
  ['IT CookBook, 파이썬 for Beginner(4판)', '프로그래밍'],
  ['IT CookBook, 컴퓨터 비전과 딥러닝', 'AI/데이터과학'],
  ['IT CookBook, 반도체 공학(3판)', '전기/전자/반도체'],
  ['칼만 필터의 이해 with MATLAB', '전기/전자/반도체'],
  ['STEM CookBook, 스트랭 선형대수학(6판)', '기초수학'],
  ['STEM CookBook, MATLAB으로 배우는 선형대수학(2판)', '기초수학'],
  ['한 권으로 끝내는 회계원리', '경영/경제'],
  ['STEM CookBook, 문제 해결력을 키우는 유체역학', '공학일반'],
  ['전략적으로 졸업하는 논문작성법', '논문/연구방법'],
]

const rawBooks = await readJson<RawBook[]>('data/books_raw.json', [])
const classifications = await readJson<ClassifiedBook[]>('data/books_ai_classified.json', [])
const rawTitles = new Set(rawBooks.map((book) => book.title))
const byId = new Map(classifications.map((book) => [book.book_id, book]))
const failures: Array<{ title: string; expected: string; actual: string }> = []

for (const [title, expected] of expectations) {
  const raw = rawBooks.find((book) => book.title === title)
  if (!raw) {
    failures.push({ title, expected, actual: '도서 없음' })
    continue
  }
  const actual = byId.get(raw.book_id)?.ai_primary_category || '분류 없음'
  if (actual !== expected) failures.push({ title, expected, actual })
}

const distribution = classifications.reduce<Record<string, number>>((counts, book) => {
  counts[book.ai_primary_category] = (counts[book.ai_primary_category] ?? 0) + 1
  return counts
}, {})

console.log(JSON.stringify({ checked: expectations.length, available_books: rawTitles.size, failures, distribution }, null, 2))
if (failures.length) process.exit(1)
