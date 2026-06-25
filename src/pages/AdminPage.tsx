import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'
import AdminUsers from '@/pages/admin/AdminUsers'
import AdminGroups from '@/pages/admin/AdminGroups'
import AdminReports from '@/pages/admin/AdminReports'

type Tab = 'users' | 'groups' | 'reports'

const TABS: { key: Tab; label: string }[] = [
  { key: 'users', label: 'Usuários' },
  { key: 'groups', label: 'Grupos' },
  { key: 'reports', label: 'Relatórios' },
]

export default function AdminPage() {
  const [tab, setTab] = useState<Tab>('users')
  const fetchAll = useAdminStore((s) => s.fetchAll)
  const loading = useAdminStore((s) => s.loading)

  useEffect(() => {
    void fetchAll()
  }, [fetchAll])

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900">
              <ArrowLeft className="h-4 w-4" /> Voltar
            </Link>
            <h1 className="text-lg font-semibold text-slate-900">Painel do administrador</h1>
          </div>
          {loading && <span className="text-xs text-slate-400">Carregando…</span>}
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-6">
        <div className="mb-5 flex gap-1 border-b border-slate-200">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                tab === t.key
                  ? 'border-slate-900 text-slate-900'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'users' && <AdminUsers />}
        {tab === 'groups' && <AdminGroups />}
        {tab === 'reports' && <AdminReports />}
      </div>
    </div>
  )
}
