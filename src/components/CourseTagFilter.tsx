import { Tags } from 'lucide-react'

interface CourseTagFilterProps {
  tags: string[]
  activeTag: string
  onSelectTag: (tag: string) => void
}

export function CourseTagFilter({ tags, activeTag, onSelectTag }: CourseTagFilterProps) {
  return (
    <section className="course-filter">
      <div className="section-heading inline">
        <Tags size={18} />
        <div>
          <span className="eyebrow">강좌 태그 바로가기</span>
          <h2>교수님이 말씀하신 수업명으로 좁히기</h2>
        </div>
      </div>
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
    </section>
  )
}
