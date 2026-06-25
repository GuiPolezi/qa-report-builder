import { useMemo, useState } from 'react'
import { ChevronDown, LayoutGrid, Search } from 'lucide-react'
import { useReportsStore } from '@/store/reportsStore'
import { useUiStore } from '@/store/uiStore'
import { BLOCK_CATALOG } from '@/components/blocks/blockCatalog'

// Painel "Inserir bloco" em destaque na sidebar quando um relatório está aberto.
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
    <div className="mx-3 mt-3 rounded-2xl border border-indigo-100 bg-indigo-50/60 p-2">
      {/* Botão de destaque com a seta */}
      <button
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center justify-between rounded-xl bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm ring-1 ring-indigo-700/10 transition-colors hover:bg-indigo-700"
      >
        <span className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/20">
            <LayoutGrid className="h-4 w-4" />
          </span>
          Inserir bloco
        </span>
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>

      {/* Conteúdo expansível (animação de altura) */}
      <div
        className={`grid transition-all duration-200 ease-out ${
          open ? 'mt-2 grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="rounded-xl border border-indigo-100 bg-white p-2">
            <div className="relative mb-2">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar bloco…"
                className="w-full rounded-md border border-slate-300 py-1.5 pl-7 pr-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="max-h-[42vh] space-y-2 overflow-y-auto pr-1">
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
                          className="group flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left transition-colors hover:bg-indigo-50"
                        >
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600 transition-colors group-hover:bg-indigo-100 group-hover:text-indigo-700">
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