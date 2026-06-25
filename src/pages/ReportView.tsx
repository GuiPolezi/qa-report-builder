import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useParams } from 'react-router-dom'
import { useReportsStore } from '@/store/reportsStore'
import { useAuthStore } from '@/store/authStore'
import { relativeTime } from '@/lib/dateGroups'
import Spinner from '@/components/Spinner'
import Editor from '@/components/Editor'
import ReportRender from '@/components/ReportRender'
import { exportReportToDocx } from '@/lib/exportDocx'

export default function ReportView() {
  const { id } = useParams()
  const userId = useAuthStore((s) => s.user?.id)
  const current = useReportsStore((s) => s.current)
  const currentLoading = useReportsStore((s) => s.currentLoading)
  const openReport = useReportsStore((s) => s.openReport)
  const clearCurrent = useReportsStore((s) => s.clearCurrent)
  const setCurrentTitle = useReportsStore((s) => s.setCurrentTitle)
  const setCurrentGroup = useReportsStore((s) => s.setCurrentGroup)
  const saveCurrent = useReportsStore((s) => s.saveCurrent)
  const saveStatus = useReportsStore((s) => s.saveStatus)
  const lastSavedAt = useReportsStore((s) => s.lastSavedAt)
  const assignableGroups = useReportsStore((s) => s.assignableGroups)
  const fetchAssignableGroups = useReportsStore((s) => s.fetchAssignableGroups)
  const [exporting, setExporting] = useState(false)

  const handleDocx = async () => {
    if (!current) return
    setExporting(true)
    try {
      await exportReportToDocx(current)
    } finally {
      setExporting(false)
    }
  }

  useEffect(() => {
    void fetchAssignableGroups()
  }, [fetchAssignableGroups])

  useEffect(() => {
    if (id) void openReport(id)
    return () => {
      // Garante que alterações dentro da janela do autosave não se percam
      const st = useReportsStore.getState()
      if (st.dirty) void st.saveCurrent()
      clearCurrent()
    }
  }, [id, openReport, clearCurrent])

  if (currentLoading) return <Spinner />
  if (!current) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <p className="text-sm text-slate-500">Relatório não encontrado ou sem acesso.</p>
      </div>
    )
  }

  const isOwner = current.ownerId === userId

  const saveLabel =
    saveStatus === 'saving'
      ? 'Salvando…'
      : saveStatus === 'error'
        ? 'Erro ao salvar'
        : saveStatus === 'saved'
          ? `Salvo ${relativeTime(lastSavedAt)}`
          : 'Salvamento automático'

  return (
    <div className="flex h-full flex-col">
      {/* Header de ações */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-3">
        <div className="flex items-center gap-3">
          <span className={`text-xs ${saveStatus === 'error' ? 'text-red-600' : 'text-slate-400'}`}>
            {saveLabel}
          </span>
          {!isOwner && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
              Somente leitura (compartilhado)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 text-xs text-slate-500">
            Grupo:
            <select
              value={current.groupId ?? ''}
              disabled={!isOwner}
              onChange={(e) => setCurrentGroup(e.target.value || null)}
              className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-500 disabled:opacity-60"
            >
              <option value="">Pessoal</option>
              {assignableGroups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </label>
          {isOwner && (
            <button
              onClick={() => void saveCurrent()}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Salvar
            </button>
          )}
          <button
            onClick={() => window.print()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Exportar PDF
          </button>
          <button
            onClick={() => void handleDocx()}
            disabled={exporting}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
          >
            {exporting ? 'Gerando…' : 'Exportar Word'}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-3xl px-6 py-8">
          <input
            value={current.title}
            onChange={(e) => setCurrentTitle(e.target.value)}
            readOnly={!isOwner}
            placeholder="Título do relatório"
            className="mb-6 w-full border-none bg-transparent pl-11 text-3xl font-bold text-slate-900 outline-none placeholder:text-slate-300 read-only:cursor-default"
          />
          <Editor readOnly={!isOwner} />
        </div>
      </div>

      {/* Visão de impressão: portal fora do #root, usada ao Exportar PDF */}
      {createPortal(
        <div className="print-view">
          <ReportRender report={current} />
        </div>,
        document.body,
      )}
    </div>
  )
}