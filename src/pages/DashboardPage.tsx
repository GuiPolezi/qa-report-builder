import { Link } from 'react-router-dom'
import { useAuthStore, useIsAdmin } from '@/store/authStore'

// Placeholder da home autenticada. O layout real (sidebar + canvas) vem na Parte 3.
export default function DashboardPage() {
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const isAdmin = useIsAdmin()

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
        <span className="font-semibold text-slate-900">QA Report Builder</span>
        <div className="flex items-center gap-4">
          {isAdmin && (
            <Link to="/admin" className="text-sm font-medium text-slate-700 hover:underline">
              Painel admin
            </Link>
          )}
          <button
            onClick={() => void signOut()}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100"
          >
            Sair
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h1 className="text-2xl font-semibold text-slate-900">
            Olá, {profile?.full_name ?? 'usuário'} 👋
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Você está autenticado. Papel: <strong>{profile?.role ?? '—'}</strong>
          </p>
          <p className="mt-6 text-sm text-slate-600">
            A próxima parte (3) monta a sidebar com o histórico de relatórios e o canvas de edição.
          </p>
        </div>
      </main>
    </div>
  )
}
