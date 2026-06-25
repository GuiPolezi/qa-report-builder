import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { useReportsStore } from '@/store/reportsStore'
import { relativeTime } from '@/lib/dateGroups'
import Spinner from '@/components/Spinner'
import type { BlockType } from '@/types/blocks'

const BLOCK_LABELS: Record<BlockType, string> = {
  'report-header': 'Cabeçalho do Relatório',
  legend: 'Legenda de Status',
  heading: 'Título de Seção',
  step: 'Etapa Numerada',
  divider: 'Divisor',
  'status-item': 'Item de Verificação',
  'page-card': 'Página/Menu Testado',
  paragraph: 'Parágrafo',
  checklist: 'Checklist',
  'device-test': 'Teste Multi-dispositivo',
  image: 'Imagem/Print',
  link: 'Link',
  video: 'Vídeo',
  callout: 'Nota/Callout',
  table: 'Tabela',
}

export default function ReportView() {
  const { id } = useParams()
  const current = useReportsStore((s) => s.current)
  const currentLoading = useReportsStore((s) => s.currentLoading)
  const openReport = useReportsStore((s) => s.openReport)
  const clearCurrent = useReportsStore((s) => s.clearCurrent)
  const setCurrentTitle = useReportsStore((s) => s.setCurrentTitle)
  const saveCurrent = useReportsStore((s) => s.saveCurrent)
  const saveStatus = useReportsStore((s) => s.saveStatus)
  const lastSavedAt = useReportsStore((s) => s.lastSavedAt)

  useEffect(() => {
    if (id) void openReport(id)
    return () => clearCurrent()
  }, [id, openReport, clearCurrent])

  if (currentLoading) return <Spinner />
  if (!current) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-slate-500">Relatório não encontrado ou sem acesso.</p>
      </div>
    )
  }

  const saveLabel =
    saveStatus === 'saving'
      ? 'Salvando…'
      : saveStatus === 'error'
        ? 'Erro ao salvar'
        : saveStatus === 'saved'
          ? `Salvo ${relativeTime(lastSavedAt)}`
          : ''

  return (
    <div className="flex h-full flex-col">
      {/* Header de ações */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <span
          className={`text-xs ${saveStatus === 'error' ? 'text-red-600' : 'text-slate-400'}`}
        >
          {saveLabel}
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => void saveCurrent()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Salvar
          </button>
          <button
            disabled
            title="Disponível na Parte 7"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            Exportar PDF
          </button>
          <button
            disabled
            title="Disponível na Parte 7"
            className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-400"
          >
            Exportar Word
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <input
            value={current.title}
            onChange={(e) => setCurrentTitle(e.target.value)}
            onBlur={() => void saveCurrent()}
            placeholder="Título do relatório"
            className="w-full border-none bg-transparent text-3xl font-bold text-slate-900 outline-none placeholder:text-slate-300"
          />

          <div className="mt-8 space-y-2">
            {current.blocks.length === 0 && (
              <p className="text-sm text-slate-400">Este relatório ainda não tem blocos.</p>
            )}
            {current.blocks.map((b) => (
              <div
                key={b.id}
                className="rounded-lg border border-dashed border-slate-300 bg-white px-4 py-3 text-sm text-slate-600"
              >
                <span className="font-medium text-slate-800">{BLOCK_LABELS[b.type]}</span>
                <span className="ml-2 text-xs text-slate-400">({b.type})</span>
              </div>
            ))}
          </div>

          <p className="mt-8 rounded-lg bg-slate-100 px-4 py-3 text-xs text-slate-500">
            O editor de blocos (arrastar, configurar, adicionar) chega na Parte 4. Por enquanto, este
            canvas mostra os blocos já presentes no relatório e permite renomear e salvar.
          </p>
        </div>
      </div>
    </div>
  )
}
