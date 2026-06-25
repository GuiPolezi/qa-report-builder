import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trash2 } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import { relativeTime } from '@/lib/dateGroups'

export default function AdminReports() {
  const reports = useAdminStore((s) => s.reports)
  const groups = useAdminStore((s) => s.groups)
  const fetchReports = useAdminStore((s) => s.fetchReports)
  const setReportGroup = useAdminStore((s) => s.setReportGroup)
  const deleteReport = useAdminStore((s) => s.deleteReport)

  useEffect(() => {
    void fetchReports()
  }, [fetchReports])

  const onDelete = async (id: string, title: string) => {
    if (!confirm(`Excluir o relatório "${title}"?`)) return
    await deleteReport(id)
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-2.5 font-medium">Relatório</th>
            <th className="px-4 py-2.5 font-medium">Dono</th>
            <th className="px-4 py-2.5 font-medium">Grupo</th>
            <th className="px-4 py-2.5 font-medium">Atualizado</th>
            <th className="px-4 py-2.5"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {reports.map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-2.5">
                <Link to={`/r/${r.id}`} className="font-medium text-slate-800 hover:underline">
                  {r.title}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-slate-500">{r.ownerName}</td>
              <td className="px-4 py-2.5">
                <select
                  value={r.groupId ?? ''}
                  onChange={(e) => void setReportGroup(r.id, e.target.value || null)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-500"
                >
                  <option value="">Pessoal</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </td>
              <td className="px-4 py-2.5 text-slate-500">{relativeTime(r.updatedAt)}</td>
              <td className="px-4 py-2.5 text-right">
                <button
                  onClick={() => void onDelete(r.id, r.title)}
                  title="Excluir"
                  className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
          {reports.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                Nenhum relatório.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
