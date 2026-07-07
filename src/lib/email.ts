import type { Book } from '../types/book'

export function buildGmailComposeUrl(books: Book[]) {
  const subject = '[한빛아카데미] 강의 교재 검토 자료'
  const selectedBooks = books.slice(0, 6)
  const body = [
    '안녕하세요 교수님.',
    '',
    '오늘 말씀드린 강의 교재를 아래와 같이 공유드립니다.',
    '',
    ...selectedBooks.flatMap((book, index) => [
      `${index + 1}. ${book.title}`,
      `- 저자: ${book.authors.join(', ')}`,
      `- 도서 소개: ${book.mail_text || book.subtitle || '한빛 공식 상세 페이지에서 확인해 주세요.'}`,
      `- 분야: ${book.ai_primary_category}`,
      `- 상세 페이지: ${book.detail_url}`,
      '',
    ]),
    '검토 후 궁금하신 사항이 있으시면 편하게 말씀해 주세요.',
    '',
    '감사합니다.',
  ].join('\n')

  const params = new URLSearchParams({ view: 'cm', fs: '1', su: subject, body })
  return `https://mail.google.com/mail/?${params.toString()}`
}
