import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import { BookPlus, Check, ExternalLink, X } from 'lucide-react'
import type { Book } from '../types/book'
import { ReviewRequiredBadge } from './ReviewRequiredBadge'

interface BookDetailDialogProps {
  book: Book | null
  selected: boolean
  onOpenChange: (open: boolean) => void
  onToggleSelected: () => void
}

export function BookDetailDialog({ book, selected, onOpenChange, onToggleSelected }: BookDetailDialogProps) {
  return (
    <Dialog.Root open={Boolean(book)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          {book && (
            <>
              <div className="dialog-title-row">
                <div>
                  <Dialog.Title>{book.title}</Dialog.Title>
                  <Dialog.Description>{book.subtitle || book.one_line_summary}</Dialog.Description>
                </div>
                <Dialog.Close className="icon-button" aria-label="닫기">
                  <X size={19} />
                </Dialog.Close>
              </div>
              <div className="detail-layout">
                <aside className="detail-aside">
                  <img src={book.cover_url} alt={`${book.title} 표지`} />
                  <button type="button" className={selected ? 'select-action active wide' : 'select-action wide'} onClick={onToggleSelected}>
                    {selected ? <Check size={17} /> : <BookPlus size={17} />}
                    {selected ? '관심 도서에서 제거' : '관심 도서 담기'}
                  </button>
                  <a href={book.detail_url} target="_blank" rel="noreferrer" className="secondary-action wide">
                    <ExternalLink size={16} /> 한빛 상세페이지
                  </a>
                </aside>
                <Tabs.Root defaultValue="summary" className="detail-tabs">
                  <Tabs.List className="tab-list">
                    <Tabs.Trigger value="summary">핵심 요약</Tabs.Trigger>
                    <Tabs.Trigger value="official">공식 정보</Tabs.Trigger>
                    <Tabs.Trigger value="toc">목차</Tabs.Trigger>
                    <Tabs.Trigger value="ai">AI 분류</Tabs.Trigger>
                    <Tabs.Trigger value="sales">영업 정보</Tabs.Trigger>
                    <Tabs.Trigger value="mail">메일 문안</Tabs.Trigger>
                  </Tabs.List>
                  <Tabs.Content value="summary" className="tab-panel">
                    <InfoGrid
                      items={[
                        ['추천 강좌', book.course_tags.join(', ')],
                        ['대상 학과', book.target_department.join(', ')],
                        ['대상 학년', book.target_grade],
                        ['난이도', book.difficulty_level],
                      ]}
                    />
                    <p className="detail-copy">{book.one_line_summary}</p>
                    <p className="talk-box">{book.professor_talk}</p>
                  </Tabs.Content>
                  <Tabs.Content value="official" className="tab-panel">
                    <InfoGrid
                      items={[
                        ['저자', book.authors.join(', ')],
                        ['정가', book.price],
                        ['출간일', book.pub_date],
                        ['ISBN/eISBN', [book.isbn, book.eisbn].filter(Boolean).join(' / ')],
                        ['페이지', book.pages],
                        ['제공 자료', book.source_materials.join(', ') || '-'],
                      ]}
                    />
                    <p className="detail-copy">{book.intro}</p>
                  </Tabs.Content>
                  <Tabs.Content value="toc" className="tab-panel">
                    <pre className="toc-box">{book.toc}</pre>
                  </Tabs.Content>
                  <Tabs.Content value="ai" className="tab-panel">
                    <InfoGrid
                      items={[
                        ['1차 분야', book.ai_primary_category],
                        ['보조 분야', book.ai_secondary_categories.join(', ')],
                        ['강의 유형', book.teaching_type.join(', ')],
                        ['분류 신뢰도', `${Math.round(book.confidence * 100)}%`],
                        ['검수 상태', book.review_required ? '검수 필요' : '자동 승인'],
                      ]}
                    />
                    <ReviewRequiredBadge required={book.review_required} />
                    <p className="detail-copy">{book.classification_reason}</p>
                  </Tabs.Content>
                  <Tabs.Content value="sales" className="tab-panel">
                    <InfoGrid
                      items={[
                        ['영업 우선순위', book.sales_priority || '-'],
                        ['전략도서', book.is_strategy_book ? '예' : '아니오'],
                        ['디지털 교재', book.is_digital_textbook ? '예' : '아니오'],
                        ['PPT/솔루션/샘플', [book.has_ppt && 'PPT', book.has_solution && '솔루션', book.has_sample && '샘플'].filter(Boolean).join(', ') || '-'],
                      ]}
                    />
                    <ul className="selling-list">
                      {book.selling_points.map((point) => (
                        <li key={point}>{point}</li>
                      ))}
                    </ul>
                    <p className="detail-copy">{book.internal_note}</p>
                  </Tabs.Content>
                  <Tabs.Content value="mail" className="tab-panel">
                    <p className="talk-box">{book.mail_text || book.one_line_summary}</p>
                  </Tabs.Content>
                </Tabs.Root>
              </div>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function InfoGrid({ items }: { items: Array<[string, string]> }) {
  return (
    <dl className="info-grid">
      {items.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value || '-'}</dd>
        </div>
      ))}
    </dl>
  )
}
