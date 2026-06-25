import type { Block, StatusValue } from '@/types/blocks'

export interface StatusSummary {
  counts: Record<StatusValue, number>
  total: number
  display: StatusValue[] // status a exibir (vindos da legenda do relatório)
}

const ORDER: StatusValue[] = ['problem', 'success', 'untested', 'partial']
const DEFAULT_LEGEND: StatusValue[] = ['problem', 'success', 'untested']

// Conta os itens com status em todo o relatório e decide quais status exibir
// com base na legenda existente (conforme pedido).
export function summarizeStatuses(blocks: Block[]): StatusSummary {
  const counts: Record<StatusValue, number> = { success: 0, problem: 0, untested: 0, partial: 0 }

  for (const b of blocks) {
    if (b.type === 'status-item') counts[b.status]++
    else if (b.type === 'page-card') b.findings.forEach((f) => counts[f.status]++)
    else if (b.type === 'device-test') b.devices.forEach((d) => counts[d.status]++)
  }

  const total = ORDER.reduce((sum, s) => sum + counts[s], 0)

  // Status definidos na legenda do relatório (primeira legenda encontrada)
  const legend = blocks.find((b) => b.type === 'legend')
  const legendStatuses = legend
    ? Array.from(new Set(legend.items.map((i) => i.status)))
    : DEFAULT_LEGEND

  // Exibe os status da legenda + qualquer status que apareça nos itens
  const display = ORDER.filter((s) => legendStatuses.includes(s) || counts[s] > 0)

  return { counts, total, display }
}