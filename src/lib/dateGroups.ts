import type { ReportListItem } from '@/store/reportsStore'

export interface DateGroup {
  key: string
  label: string
  items: ReportListItem[]
}

// Agrupa relatórios em Hoje / Ontem / Últimos 7 dias / Mais antigos
export function groupByDate(items: ReportListItem[]): DateGroup[] {
  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const startOfYesterday = startOfToday - 24 * 60 * 60 * 1000
  const sevenDaysAgo = startOfToday - 7 * 24 * 60 * 60 * 1000

  const groups: Record<string, DateGroup> = {
    hoje: { key: 'hoje', label: 'Hoje', items: [] },
    ontem: { key: 'ontem', label: 'Ontem', items: [] },
    semana: { key: 'semana', label: 'Últimos 7 dias', items: [] },
    antigos: { key: 'antigos', label: 'Mais antigos', items: [] },
  }

  for (const item of items) {
    const t = new Date(item.updatedAt).getTime()
    if (t >= startOfToday) groups.hoje.items.push(item)
    else if (t >= startOfYesterday) groups.ontem.items.push(item)
    else if (t >= sevenDaysAgo) groups.semana.items.push(item)
    else groups.antigos.items.push(item)
  }

  return Object.values(groups).filter((g) => g.items.length > 0)
}

// "Salvo há 2 min", "Salvo agora", etc.
export function relativeTime(iso: string | null): string {
  if (!iso) return ''
  const diff = Date.now() - new Date(iso).getTime()
  const min = Math.floor(diff / 60000)
  if (min < 1) return 'agora'
  if (min < 60) return `há ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `há ${h} h`
  const d = Math.floor(h / 24)
  return `há ${d} d`
}
