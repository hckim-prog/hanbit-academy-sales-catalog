interface CategoryOverviewProps {
  categories: string[]
  activeCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryOverview({ categories, activeCategory, onSelectCategory }: CategoryOverviewProps) {
  return (
    <section className="category-overview">
      <div className="section-heading">
        <span className="eyebrow">AI 영업 분야</span>
        <h2>분야별 상담 보드</h2>
      </div>
      <div className="category-grid">
        {categories.map((category) => (
          <button
            type="button"
            key={category}
            className={category === activeCategory ? 'category-card active' : 'category-card'}
            onClick={() => onSelectCategory(category)}
          >
            <span>{category}</span>
          </button>
        ))}
      </div>
    </section>
  )
}
