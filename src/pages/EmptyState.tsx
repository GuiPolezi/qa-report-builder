import { useNavigate } from 'react-router-dom'
import { useReportsStore } from '@/store/reportsStore'
import { useState } from 'react'

// Mostrado em "/" quando nenhum relatório está aberto.
export default function EmptyState() {
  const navigate = useNavigate()
  const createReport = useReportsStore((s) => s.createReport)
  const [creating, setCreating] = useState(false)

  const onNew = async () => {
    setCreating(true)
    const id = await createReport()
    setCreating(false)
    if (id) navigate(`/r/${id}`)
  }

  return (
    <div className="flex h-full items-center justify-center p-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-slate-900">Nenhum relatório aberto</h2>
        <p className="mt-1 text-sm text-slate-500">
          Selecione um relatório na barra lateral ou crie um novo.
        </p>
        <button
          onClick={() => void onNew()}
          disabled={creating}
          className="mt-4 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {creating ? 'Criando…' : '+ Novo Relatório'}
        </button>
      </div>
    </div>
  )
}
