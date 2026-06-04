import type { Book } from '../types/book'

const professorGuideUrl = 'https://digital-textbook-professor-adoption.vercel.app/'
const studentGuideUrl = 'https://digital-textbook-student-guide.vercel.app/'

export function buildGmailComposeUrl(books: Book[]) {
  const subject = '[한빛아카데미] 강의 교재 검토 자료 공유드립니다'
  const selectedBooks = books.slice(0, 6)
  const body = [
    '안녕하세요 교수님.',
    '',
    '오늘 말씀드린 강의 교재 검토 자료를 아래와 같이 공유드립니다.',
    '',
    ...selectedBooks.flatMap((book, index) => [
      `${index + 1}. ${book.title}`,
      `- 한 줄 소개: ${book.mail_text || book.one_line_summary}`,
      `- 추천 강좌: ${book.course_tags.slice(0, 3).join(', ')}`,
      `- 상세 페이지: ${book.detail_url}`,
      '',
    ]),
    '추가로 디지털 교재 안내 자료도 함께 참고 부탁드립니다.',
    '',
    `교수용 안내 페이지: ${professorGuideUrl}`,
    `학생용 안내 페이지: ${studentGuideUrl}`,
    '',
    '감사합니다.',
  ].join('\n')

  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    su: subject,
    body,
  })

  return `https://mail.google.com/mail/?${params.toString()}`
}
