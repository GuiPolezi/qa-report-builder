import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useAdminStore } from '@/store/adminStore'

export default function AdminGroups() {
  const groups = useAdminStore((s) => s.groups)
  const users = useAdminStore((s) => s.users)
  const memberships = useAdminStore((s) => s.memberships)
  const createGroup = useAdminStore((s) => s.createGroup)
  const updateGroup = useAdminStore((s) => s.updateGroup)
  const deleteGroup = useAdminStore((s) => s.deleteGroup)
  const addMember = useAdminStore((s) => s.addMember)
  const removeMember = useAdminStore((s) => s.removeMember)

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [editName, setEditName] = useState('')
  const [editDesc, setEditDesc] = useState('')

  const selected = groups.find((g) => g.id === selectedId) ?? null

  // Sincroniza os campos locais ao trocar de grupo selecionado
  useEffect(() => {
    setEditName(selected?.name ?? '')
    setEditDesc(selected?.description ?? '')
  }, [selectedId, selected?.name, selected?.description])

  const isMember = (userId: string) =>
    selected ? memberships.some((m) => m.group_id === selected.id && m.user_id === userId) : false

  const onCreate = async () => {
    const name = newName.trim()
    if (!name) return
    await createGroup(name, '')
    setNewName('')
  }

  const onDelete = async (id: string, name: string) => {
    if (!confirm(`Excluir o grupo "${name}"? Os relatórios deixarão de ser compartilhados por ele.`)) return
    await deleteGroup(id)
    if (selectedId === id) setSelectedId(null)
  }

  return (
    <div className="grid grid-cols-[280px_1fr] gap-4">
      {/* Lista de grupos */}
      <div className="rounded-xl border border-slate-200 bg-white p-3">
        <div className="flex gap-2">
          <input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && void onCreate()}
            placeholder="Novo grupo…"
            className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-500"
          />
          <button onClick={() => void onCreate()} className="flex items-center rounded-lg bg-slate-900 px-2.5 text-white hover:bg-slate-800">
            <Plus className="h-4 w-4" />
          </button>
        </div>
        <ul className="mt-3 space-y-0.5">
          {groups.map((g) => {
            const count = memberships.filter((m) => m.group_id === g.id).length
            return (
              <li key={g.id}>
                <button
                  onClick={() => setSelectedId(g.id)}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm ${
                    selectedId === g.id ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span className="truncate">{g.name}</span>
                  <span className="text-xs text-slate-400">{count}</span>
                </button>
              </li>
            )
          })}
          {groups.length === 0 && <p className="px-2 py-3 text-sm text-slate-400">Nenhum grupo ainda.</p>}
        </ul>
      </div>

      {/* Detalhe do grupo */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        {!selected ? (
          <p className="py-8 text-center text-sm text-slate-400">Selecione um grupo para gerenciar os membros.</p>
        ) : (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onBlur={() => editName.trim() && editName !== selected.name && void updateGroup(selected.id, { name: editName.trim() })}
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm font-medium outline-none focus:border-slate-500"
                />
                <input
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  onBlur={() => editDesc !== (selected.description ?? '') && void updateGroup(selected.id, { description: editDesc })}
                  placeholder="Descrição (opcional)"
                  className="w-full rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-500"
                />
              </div>
              <button
                onClick={() => void onDelete(selected.id, selected.name)}
                className="flex items-center gap-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir
              </button>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Membros</p>
              <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
                {users.map((u) => {
                  const member = isMember(u.id)
                  return (
                    <li key={u.id} className="flex items-center justify-between px-3 py-2 text-sm">
                      <span>
                        <span className="font-medium text-slate-800">{u.full_name ?? u.email}</span>
                        <span className="ml-2 text-xs text-slate-400">{u.email}</span>
                      </span>
                      <button
                        onClick={() =>
                          member ? void removeMember(selected.id, u.id) : void addMember(selected.id, u.id)
                        }
                        className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                          member
                            ? 'border border-slate-300 text-slate-600 hover:bg-slate-50'
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                      >
                        {member ? 'Remover' : 'Adicionar'}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
