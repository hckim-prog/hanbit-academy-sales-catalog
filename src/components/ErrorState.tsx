import { CircleAlert } from 'lucide-react'

export function ErrorState({ title }: { title: string }) {
  return (
    <section className="state-box">
      <CircleAlert size={28} />
      <h2>{title}</h2>
      <p>데이터 병합 스크립트를 실행한 뒤 다시 확인하세요.</p>
    </section>
  )
}
