import { Link } from 'react-router-dom'

// Placeholder do painel admin. Gestão de usuários/grupos vem na Parte 6.
export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">Painel do administrador</h1>
        <p className="mt-2 text-sm text-slate-500">
          Acesso restrito a admins (rota protegida funcionando). Gestão de usuários, grupos e
          relatórios chega na Parte 6.
        </p>
        <Link to="/" className="mt-6 inline-block text-sm font-medium text-slate-900 hover:underline">
          ← Voltar
        </Link>
      </div>
    </div>
  )
}
