import { Loader2 } from 'lucide-react'

export function LoadingState({ label }: { label: string }) {
  return (
    <section className="state-box full">
      <Loader2 size={30} className="spin" />
      <h2>{label}</h2>
    </section>
  )
}
