import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(value: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(value))
}

export function isNewBook(pubDate: string) {
  if (!pubDate) return false
  const published = new Date(pubDate).getTime()
  const days = (Date.now() - published) / (1000 * 60 * 60 * 24)
  return days <= 240
}
