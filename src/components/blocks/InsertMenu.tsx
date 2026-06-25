import { useEffect, useMemo, useRef, useState } from 'react'
import {
  Heading, ListOrdered, Minus, FileText, Palette, AlignLeft, CircleCheckBig,
  LayoutPanelTop, ListChecks, MonitorSmartphone, Table, StickyNote,
  Image as ImageIcon, Link as LinkIcon, Video, Search,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import type { BlockType } from '@/types/blocks'

interface Entry {
  type: BlockType
  label: string
  desc: string
  icon: LucideIcon
  group: string
}

const CATALOG: Entry[] = [
  { type: 'heading', label: 'Título de seção', desc: 'Divide o relatório em seções (H1–H3)', icon: Heading, group: 'Estrutura' },
  { type: 'step', label: 'Etapa numerada', desc: 'Passo numerado: Etapa 1, 2, 3…', icon: ListOrdered, group: 'Estrutura' },
  { type: 'divider', label: 'Divisor', desc: 'Linha que separa trechos', icon: Minus, group: 'Estrutura' },
  { type: 'report-header', label: 'Cabeçalho do relatório', desc: 'Cliente, URL, versão, navegador, técnico', icon: FileText, group: 'Estrutura' },
  { type: 'legend', label: 'Legenda de status', desc: 'Cores e o que cada status significa', icon: Palette, group: 'Estrutura' },
  { type: 'paragraph', label: 'Parágrafo', desc: 'Texto livre e observações', icon: AlignLeft, group: 'Conteúdo' },
  { type: 'status-item', label: 'Item de verificação', desc: 'Um item testado com status colorido', icon: CircleCheckBig, group: 'Conteúdo' },
  { type: 'page-card', label: 'Página/menu testado', desc: 'Uma página com vários itens verificados', icon: LayoutPanelTop, group: 'Conteúdo' },
  { type: 'checklist', label: 'Checklist (to-do)', desc: 'Lista de tarefas com caixas de seleção', icon: ListChecks, group: 'Conteúdo' },
  { type: 'device-test', label: 'Teste multi-dispositivo', desc: 'Mesma página em vários aparelhos', icon: MonitorSmartphone, group: 'Conteúdo' },
  { type: 'table', label: 'Tabela', desc: 'Tabela de URLs e status', icon: Table, group: 'Conteúdo' },
  { type: 'callout', label: 'Nota / callout', desc: 'Caixa de nota, atenção ou conclusão', icon: StickyNote, group: 'Conteúdo' },
  { type: 'image', label: 'Imagem / print', desc: 'Print do problema: enviar, arrastar ou colar', icon: ImageIcon, group: 'Mídia' },
  { type: 'link', label: 'Link', desc: 'URL testada', icon: LinkIcon, group: 'Mídia' },
  { type: 'video', label: 'Vídeo', desc: 'Vídeo demonstrando o bug', icon: Video, group: 'Mídia' },
]

export default function InsertMenu({
  onPick,
  onClose,
  align = 'left',
}: {
  onPick: (type: BlockType) => void
  onClose: () => void
  align?: 'left' | 'center' | 'gutter'
}) {
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const groups = useMemo(() => {
    const q = query.trim().toLowerCase()
    const filtered = CATALOG.filter(
      (e) => e.label.toLowerCase().includes(q) || e.desc.toLowerCase().includes(q),
    )
    const map = new Map<string, Entry[]>()
    for (const e of filtered) {
      if (!map.has(e.group)) map.set(e.group, [])
      map.get(e.group)!.push(e)
    }
    return [...map.entries()]
  }, [query])

  const pos =
    align === 'center'
      ? 'left-1/2 top-full mt-1 -translate-x-1/2'
      : align === 'gutter'
        ? 'left-8 top-0'
        : 'left-0 top-full mt-1'

  return (
    <div
      ref={ref}
      className={`absolute z-30 w-[26rem] rounded-xl border border-slate-200 bg-white p-3 shadow-xl ${pos}`}
    >
      <div className="relative mb-3">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar bloco…"
          className="w-full rounded-lg border border-slate-300 py-2 pl-8 pr-3 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />
      </div>

      <div className="max-h-[22rem] overflow-y-auto pr-1">
        {groups.length === 0 && <p className="px-1 py-3 text-sm text-slate-400">Nada encontrado.</p>}
        {groups.map(([group, entries]) => (
          <div key={group} className="mb-3">
            <p className="mb-1.5 px-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {group}
            </p>
            <div className="grid grid-cols-2 gap-2">
              {entries.map((e) => {
                const Icon = e.icon
                return (
                  <button
                    key={e.type}
                    onClick={() => onPick(e.type)}
                    className="flex items-start gap-2.5 rounded-lg border border-slate-200 p-2.5 text-left transition-colors hover:border-slate-400 hover:bg-slate-50"
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-600">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-slate-800">{e.label}</span>
                      <span className="block text-xs leading-snug text-slate-500">{e.desc}</span>
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}