import { useEffect, useRef, useState } from 'react'
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useReportsStore } from '@/store/reportsStore'
import BlockRow from '@/components/blocks/BlockRow'
import InsertMenu from '@/components/blocks/InsertMenu'

export default function Editor({ readOnly = false }: { readOnly?: boolean }) {
  const current = useReportsStore((s) => s.current)
  const reorderBlocks = useReportsStore((s) => s.reorderBlocks)
  const prependBlock = useReportsStore((s) => s.prependBlock)
  const saveCurrent = useReportsStore((s) => s.saveCurrent)
  const [menuOpen, setMenuOpen] = useState(false)

  // ---- Autosave (debounce 1s; não salva no carregamento, em no-op, nem em leitura) ----
  const idRef = useRef<string | null>(null)
  const snapRef = useRef('')
  useEffect(() => {
    if (!current || readOnly) return
    const snap = JSON.stringify({ t: current.title, b: current.blocks, g: current.groupId })
    if (idRef.current !== current.id) {
      idRef.current = current.id
      snapRef.current = snap
      return
    }
    if (snap === snapRef.current) return
    snapRef.current = snap
    const timer = setTimeout(() => void saveCurrent(), 1000)
    return () => clearTimeout(timer)
  }, [current, saveCurrent, readOnly])

  // ---- Atalho "/" para abrir o insertor do topo (quando não estiver digitando) ----
  useEffect(() => {
    if (readOnly) return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        setMenuOpen(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [readOnly])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (!current) return null
  const ids = current.blocks.map((b) => b.id)

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) reorderBlocks(String(active.id), String(over.id))
  }

  // Modo somente leitura: desabilita todos os campos e botões internos
  if (readOnly) {
    return (
      <fieldset disabled className="m-0 min-w-0 border-0 p-0 pl-8">
        {current.blocks.map((b) => (
          <BlockRow key={b.id} block={b} />
        ))}
      </fieldset>
    )
  }

  return (
    <div>
      {/* Insertor fixo no topo (Gutenberg-style): sempre visível, insere no início */}
      <div className="relative mb-1 pl-8">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-500 hover:border-slate-400 hover:bg-slate-50 hover:text-slate-700"
        >
          <Plus className="h-4 w-4" /> Adicionar bloco
          <span className="ml-1 text-xs text-slate-400">ou tecle /</span>
        </button>
        {menuOpen && (
          <InsertMenu
            onPick={(t) => {
              prependBlock(t)
              setMenuOpen(false)
            }}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div>
            {current.blocks.map((b) => (
              <BlockRow key={b.id} block={b} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {current.blocks.length === 0 && (
        <p className="py-6 pl-8 text-sm text-slate-400">
          Nenhum bloco ainda. Use “Adicionar bloco” acima, ou passe o mouse sobre um bloco e use o “+” na lateral.
        </p>
      )}
    </div>
  )
}