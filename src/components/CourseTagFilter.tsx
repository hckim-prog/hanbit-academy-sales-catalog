import { BookOpenCheck, CheckCircle2, GraduationCap, Layers3, MonitorCheck, Sparkles, Tags } from 'lucide-react'

interface CourseTagFilterProps {
  tags: string[]
  activeTag: string
  activeDifficulty: string
  flags: {
    strategy: boolean
    digital: boolean
    materials: boolean
    review: boolean
    newOnly: boolean
  }
  onSelectTag: (tag: string) => void
  onSelectDifficulty: (difficulty: string) => void
  onToggleFlag: (flag: keyof CourseTagFilterProps['flags']) => void
}

const difficulties = ['전체', '입문', '초급', '중급', '고급']

const quickFilters = [
  ['newOnly', '신간', Sparkles],
  ['strategy', '전략도서', BookOpenCheck],
  ['digital', '디지털 교재', MonitorCheck],
  ['materials', '강의자료', Layers3],
  ['review', '검수 필요', CheckCircle2],
] as const

export function CourseTagFilter({
  tags,
  activeTag,
  activeDifficulty,
  flags,
  onSelectTag,
  onSelectDifficulty,
  onToggleFlag,
}: CourseTagFilterProps) {
  return (
    <section className="course-filter">
      <div className="section-heading inline">
        <Tags size={18} />
        <div>
          <span className="eyebrow">Course Finder</span>
          <h2>강좌 조건으로 빠르게 좁히기</h2>
        </div>
      </div>
      <div className="filter-console">
        <div className="filter-block">
          <span className="filter-label">
            <GraduationCap size={15} /> 난이도
          </span>
          <div className="filter-chip-row">
            {difficulties.map((difficulty) => (
              <button
                key={difficulty}
                type="button"
                className={difficulty === activeDifficulty ? 'tag-pill active' : 'tag-pill'}
                onClick={() => onSelectDifficulty(difficulty)}
              >
                {difficulty}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-block">
          <span className="filter-label">주요 조건</span>
          <div className="filter-chip-row">
            {quickFilters.map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                className={flags[key] ? 'filter-chip active' : 'filter-chip'}
                onClick={() => onToggleFlag(key)}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="filter-block wide-filter">
          <span className="filter-label">강좌 태그</span>
          <div className="tag-scroll">
            {tags.map((tag) => (
              <button
                key={tag}
                type="button"
                className={tag === activeTag ? 'tag-pill active' : 'tag-pill'}
                onClick={() => onSelectTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
