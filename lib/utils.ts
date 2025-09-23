import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: string | Date) {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function getInitials(name: string) {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function calculateCHAScore(scores: { category: string; score: number; weight: number }[]) {
  const groupedScores = scores.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = { total: 0, weight: 0 }
    }
    acc[item.category].total += item.score * item.weight
    acc[item.category].weight += item.weight
    return acc
  }, {} as Record<string, { total: number; weight: number }>)

  const categoryAverages = Object.entries(groupedScores).map(([category, data]) => ({
    category,
    average: data.total / data.weight,
  }))

  const overallScore = categoryAverages.reduce((sum, cat) => sum + cat.average, 0) / categoryAverages.length

  return {
    categoryAverages,
    overallScore,
  }
}

