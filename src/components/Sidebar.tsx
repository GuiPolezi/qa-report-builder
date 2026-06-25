import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuthStore, useIsAdmin } from '@/store/authStore'
import { useReportsStore } from '@/store/reportsStore'
import { groupByDate } from '@/lib/dateGroups'
import { parseDocx, dataUrlToFile } from '@/lib/importDocx'
import { uploadReportImage } from '@/lib/storage'

export default function Sidebar() {
  const navigate = useNavigate()
  const { id: activeId } = useParams()
  const profile = useAuthStore((s) => s.profile)
  const signOut = useAuthStore((s) => s.signOut)
  const isAdmin = useIsAdmin()

  const list = useReportsStore((s) => s.list)
  const listLoading = useReportsStore((s) => s.listLoading)
  const fetchList = useReportsStore((s) => s.fetchList)
  const createReport = useReportsStore((s) => s.createReport)
  const createReportWithBlocks = useReportsStore((s) => s.createReportWithBlocks)
  const updateReportBlocks = useReportsStore((s) => s.updateReportBlocks)
  const deleteReport = useReportsStore((s) => s.deleteReport)
  const userId = useAuthStore((s) => s.user?.id)

  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)
  const [importing, setImporting] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    void fetchList()
  }, [fetchList])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.clientName ?? '').toLowerCase().includes(q),
    )
  }, [list, query])

  const groups = useMemo(() => groupByDate(filtered), [filtered])

  const onNew = async () => {
    setCreating(true)
    const id = await createReport()
    setCreating(false)
    if (id) navigate(`/r/${id}`)
  }

  const onImportFile = async (file?: File | null) => {
    if (fileRef.current) fileRef.current.value = ''
    if (!file) return
    setImporting(true)
    try {
      const buf = await file.arrayBuffer()
      const name = file.name.replace(/\.docx$/i, '')
      const { title, blocks, images } = await parseDocx(buf, name)
      const id = await createReportWithBlocks(title, blocks)
      if (!id) throw new Error('Falha ao criar o relatório')

      if (images.length && userId) {
        const pathByBlock = new Map<string, string>()
        for (const img of images) {
          try {
            const f = dataUrlToFile(img.dataUrl, 'import')
            const path = await uploadReportImage(f, id, userId)
            pathByBlock.set(img.blockId, path)
          } catch (e) {
            console.error('[import] imagem:', e)
          }
        }
        const finalBlocks = blocks.map((b) =>
          b.type === 'image' && pathByBlock.has(b.id)
            ? { ...b, storagePath: pathByBlock.get(b.id)! }
            : b,
        )
        await updateReportBlocks(id, finalBlocks)
      }
      navigate(`/r/${id}`)
    } catch (e) {
      console.error('[import]', e)
      alert('Não foi possível importar. Verifique se o arquivo é um .docx válido.')
    } finally {
      setImporting(false)
    }
  }

  const onDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm(`Excluir o relatório "${title}"? Esta ação não pode ser desfeita.`)) return
    await deleteReport(id)
    if (activeId === id) navigate('/')
  }

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">
      {/* Logo (clicável: volta à página inicial) */}
      <Link to="/" className="flex items-center gap-2 px-4 py-4 transition-colors hover:bg-slate-50">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
          QA
        </div>
        <span className="font-semibold text-slate-900">Report Builder</span>
      </Link>

      {/* Novo relatório */}
      <div className="px-3">
        <button
          onClick={() => void onNew()}
          disabled={creating}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          <span className="text-lg leading-none">+</span>
          {creating ? 'Criando…' : 'Novo Relatório'}
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          {importing ? 'Importando…' : 'Importar Word'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".docx"
          className="hidden"
          onChange={(e) => void onImportFile(e.target.files?.[0])}
        />
      </div>

      {/* Busca */}
      <div className="px-3 pt-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar por nome ou cliente…"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      {/* Lista agrupada */}
      <nav className="mt-3 flex-1 overflow-y-auto px-2 pb-4">
        {listLoading && <p className="px-2 py-4 text-sm text-slate-400">Carregando…</p>}
        {!listLoading && filtered.length === 0 && (
          <p className="px-2 py-4 text-sm text-slate-400">
            {query ? 'Nenhum relatório encontrado.' : 'Nenhum relatório ainda.'}
          </p>
        )}
        {groups.map((group) => (
          <div key={group.key} className="mb-3">
            <p className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-slate-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((r) => {
                const active = r.id === activeId
                const owned = r.ownerId === profile?.id
                return (
                  <li key={r.id}>
                    <Link
                      to={`/r/${r.id}`}
                      className={`group flex items-center justify-between rounded-lg px-2 py-2 text-sm ${
                        active ? 'bg-slate-100 font-medium text-slate-900' : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="flex min-w-0 items-center gap-1.5">
                        <span className="truncate">{r.title || 'Sem título'}</span>
                        {!owned && (
                          <span title="Compartilhado por um grupo" className="shrink-0 text-xs text-slate-400">
                            ↗
                          </span>
                        )}
                      </span>
                      {owned && (
                        <button
                          onClick={(e) => void onDelete(e, r.id, r.title)}
                          title="Excluir"
                          className="ml-2 hidden shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600 group-hover:block"
                        >
                          🗑
                        </button>
                      )}
                    </Link>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Rodapé do usuário */}
      <div className="border-t border-slate-200 p-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-sm font-medium text-slate-700">
            {(profile?.full_name ?? '?').charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">{profile?.full_name ?? 'Usuário'}</p>
            <p className="truncate text-xs text-slate-400">{profile?.email}</p>
          </div>
        </div>
        <div className="mt-2 flex items-center gap-2">
          {isAdmin && (
            <Link
              to="/admin"
              className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-center text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Admin
            </Link>
          )}
          <button
            onClick={() => void signOut()}
            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Sair
          </button>
        </div>
      </div>
    </aside>
  )
}