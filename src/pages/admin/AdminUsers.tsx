import { useAdminStore } from '@/store/adminStore'
import { useAuthStore } from '@/store/authStore'
import type { UserRole } from '@/store/authStore'

export default function AdminUsers() {
  const users = useAdminStore((s) => s.users)
  const setUserRole = useAdminStore((s) => s.setUserRole)
  const meId = useAuthStore((s) => s.user?.id)

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-4 py-2.5 font-medium">Nome</th>
            <th className="px-4 py-2.5 font-medium">E-mail</th>
            <th className="px-4 py-2.5 font-medium">Papel</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {users.map((u) => (
            <tr key={u.id}>
              <td className="px-4 py-2.5 font-medium text-slate-800">
                {u.full_name ?? '—'}
                {u.id === meId && <span className="ml-2 text-xs text-slate-400">(você)</span>}
              </td>
              <td className="px-4 py-2.5 text-slate-500">{u.email}</td>
              <td className="px-4 py-2.5">
                <select
                  value={u.role}
                  onChange={(e) => void setUserRole(u.id, e.target.value as UserRole)}
                  className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-500"
                >
                  <option value="member">Membro</option>
                  <option value="admin">Administrador</option>
                </select>
              </td>
            </tr>
          ))}
          {users.length === 0 && (
            <tr>
              <td colSpan={3} className="px-4 py-6 text-center text-slate-400">
                Nenhum usuário.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}
