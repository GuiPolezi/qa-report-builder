import { useMemo } from 'react'
import type { Block } from '@/types/blocks'
import { STATUS_META } from '@/types/blocks'
import { summarizeStatuses } from '@/lib/statusSummary'

// Dashboard do relatório: conta itens por status (conforme a legenda).
export default function ReportSummary({ blocks }: { blocks: Block[] }) {
  const { counts, total, display } = useMemo(() => summarizeStatuses(blocks), [blocks])

  if (total === 0) {
    return (
      <div className="mb-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400">
        O resumo aparece aqui assim que houver itens com status (item de verificação, página testada ou multi-dispositivo).
      </div>
    )
  }

  return (
    <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Resumo do relatório</span>
        <span className="text-xs text-slate-400">{total} {total === 1 ? 'item' : 'itens'} verificados</span>
      </div>

      {/* Barra proporcional por status */}
      <div className="mt-2.5 flex h-2.5 overflow-hidden rounded-full bg-slate-100">
        {display.map((s) =>
          counts[s] > 0 ? (
            <div
              key={s}
              title={`${STATUS_META[s].label}: ${counts[s]}`}
              style={{ width: `${(counts[s] / total) * 100}%`, backgroundColor: STATUS_META[s].color }}
            />
          ) : null,
        )}
      </div>

      {/* Contadores por status */}
      <div className="mt-3 flex flex-wrap gap-2">
        {display.map((s) => (
          <div
            key={s}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-2.5 py-1 text-sm"
          >
            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: STATUS_META[s].color }} />
            <span className="text-slate-600">{STATUS_META[s].label}</span>
            <span className="font-semibold text-slate-900">{counts[s]}</span>
          </div>
        ))}
      </div>
    </div>
  )
}