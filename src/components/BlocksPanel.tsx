import { useMemo, useState } from 'react'
import { ChevronDown, LayoutGrid, Search } from 'lucide-react'
import { useReportsStore } from '@/store/reportsStore'
import { useUiStore } from '@/store/uiStore'
import { BLOCK_CATALOG } from '@/components/blocks/blockCatalog'

// Painel "Inserir bloco" que vive na sidebar quando um relatório está aberto.
// Clicou na seta -> expande e mostra o catálogo de blocos.
export default function BlocksPanel() {
  const open = useUiStore((s) => s.blocksPanelOpen)
  const toggle = useUiStore((s) => s.toggleBlocksPanel)
  const insertBlock = useReportsStore((s) => s.insertBlock)
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = BLOCK_CATALOG.filter(
      (e) => e.label.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q),
    )
    const map = new Map<string, typeof BLOCK_CATALOG>()
    for (const e of filtered) {
      if (!map.has(e.group)) map.set(e.group, [])
      map.get(e.group)!.push(e)
    }
    return [...map.entries()]
  }, [query])

  return (
    <div className="px-3 pt-3">
      {/* Cabeçalho com a seta */}
      <button
        onClick={toggle}
        className="flex w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
      >
        <span className="flex items-center gap-2">
          <LayoutGrid className="h-4 w-4 text-slate-500" />
          Inserir bloco
        </span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Conteúdo expansível */}
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-lg border border-slate-200 bg-white p-2">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar bloco…"
                className="w-full rounded-md border border-slate-300 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div className="max-h-[44vh] space-y-2 overflow-y-auto pr-1">
              {groups.length === 0 && <p className="px-1 py-2 text-sm text-slate-400">Nada encontrado.</p>}
              {groups.map(([group, entries]) => (
                <div key={group}>
                  <p className="px-1 pb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">{group}</p>
                  <div className="space-y-0.5">
                    {entries.map((e) => {
                      const Icon = e.icon
                      return (
                        <button
                          key={e.type}
                          onClick={() => insertBlock(e.type)}
                          title={e.desc}
                          className="flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-slate-100"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="truncate text-sm text-slate-700">{e.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}