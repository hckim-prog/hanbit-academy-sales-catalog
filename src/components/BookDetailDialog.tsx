import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { BookOpenText, BookPlus, Check, ExternalLink, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { Book } from '../types/book'

interface OfficialDetails { intro: string; toc: string; author_intro: string }
const detailsUrl = new URL('../../data/book_details.json', import.meta.url).href
let detailsCache: Record<string, OfficialDetails> | null = null

interface BookDetailDialogProps { book: Book | null; selected: boolean; onOpenChange: (open: boolean) => void; onToggleSelected: () => void }

export function BookDetailDialog({ book, selected, onOpenChange, onToggleSelected }: BookDetailDialogProps) {
  const [details, setDetails] = useState<OfficialDetails | null>(() =>
    book && detailsCache ? detailsCache[book.book_id] ?? null : null,
  )

  useEffect(() => {
    if (!book) return
    if (detailsCache) return
    const controller = new AbortController()
    fetch(detailsUrl, { signal: controller.signal })
      .then((response) => response.json() as Promise<Record<string, OfficialDetails>>)
      .then((payload) => {
        detailsCache = payload
        setDetails(payload[book.book_id] ?? null)
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setDetails(null)
      })
    return () => controller.abort()
  }, [book])

  if (!book) return null
  const intro = details?.intro ?? ''
  const toc = details?.toc ?? ''
  const authorIntro = details?.author_intro ?? ''

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content simple-detail">
          <Dialog.Close className="detail-close" aria-label="상세정보 닫기"><X size={21} /></Dialog.Close>
          <div className="detail-layout">
            <aside className="detail-aside">
              <img src={book.cover_url} alt={`${book.title} 표지`} />
              <button type="button" className={selected ? 'save-book active wide' : 'save-book wide'} onClick={onToggleSelected}>
                {selected ? <Check size={17} /> : <BookPlus size={17} />}{selected ? '관심 도서에 담김' : '관심 도서 담기'}
              </button>
              <a href={book.detail_url} target="_blank" rel="noreferrer" className="publisher-link"><ExternalLink size={16} /> 한빛 공식 페이지</a>
            </aside>
            <div className="detail-main">
              <span className="detail-category">{book.ai_primary_category}</span>
              <Dialog.Title>{book.title}</Dialog.Title>
              {book.subtitle && <Dialog.Description>{book.subtitle}</Dialog.Description>}
              <InfoGrid items={[
                ['저자', book.authors.join(', ')], ['출간일', book.pub_date], ['ISBN', book.isbn], ['페이지', book.pages], ['정가', book.price], ['도서 유형', book.book_type],
              ]} />
              <Tabs.Root defaultValue="intro">
                <Tabs.List className="tab-list" aria-label="한빛 공식 도서정보">
                  <Tabs.Trigger value="intro">책소개</Tabs.Trigger>
                  <Tabs.Trigger value="toc">목차</Tabs.Trigger>
                  {authorIntro && <Tabs.Trigger value="author">저자소개</Tabs.Trigger>}
                </Tabs.List>
                <Tabs.Content value="intro" className="tab-panel"><p className="official-copy">{details ? (intro || '한빛 공식 페이지에서 책소개를 확인해 주세요.') : '공식 책소개를 불러오는 중입니다.'}</p></Tabs.Content>
                <Tabs.Content value="toc" className="tab-panel"><pre className="toc-box">{details ? (toc || '한빛 공식 페이지에서 목차를 확인해 주세요.') : '공식 목차를 불러오는 중입니다.'}</pre></Tabs.Content>
                {authorIntro && <Tabs.Content value="author" className="tab-panel"><p className="official-copy">{authorIntro}</p></Tabs.Content>}
              </Tabs.Root>
              <a href={book.detail_url} target="_blank" rel="noreferrer" className="sample-cta"><BookOpenText size={18} /> 한빛 공식 도서정보 보기</a>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return <dl className="info-grid official-info-grid">{items.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value || '-'}</dd></div>)}</dl>
}
