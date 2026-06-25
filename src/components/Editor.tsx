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
import { useReportsStore } from '@/store/reportsStore'
import BlockRow from '@/components/blocks/BlockRow'
import InsertMenu from '@/components/blocks/InsertMenu'

export default function Editor() {
  const current = useReportsStore((s) => s.current)
  const reorderBlocks = useReportsStore((s) => s.reorderBlocks)
  const insertBlock = useReportsStore((s) => s.insertBlock)
  const saveCurrent = useReportsStore((s) => s.saveCurrent)
  const [menuOpen, setMenuOpen] = useState(false)

  // ---- Autosave (debounce 1s; não salva no carregamento nem em no-op) ----
  const idRef = useRef<string | null>(null)
  const snapRef = useRef('')
  useEffect(() => {
    if (!current) return
    const snap = JSON.stringify({ t: current.title, b: current.blocks })
    if (idRef.current !== current.id) {
      idRef.current = current.id
      snapRef.current = snap
      return
    }
    if (snap === snapRef.current) return
    snapRef.current = snap
    const timer = setTimeout(() => void saveCurrent(), 1000)
    return () => clearTimeout(timer)
  }, [current, saveCurrent])

  // ---- Atalho "/" para abrir o menu (quando não estiver digitando) ----
  useEffect(() => {
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
  }, [])

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  if (!current) return null
  const ids = current.blocks.map((b) => b.id)

  const onDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    if (over && active.id !== over.id) reorderBlocks(String(active.id), String(over.id))
  }

  return (
    <div className="pl-9">
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
        <p className="py-4 text-sm text-slate-400">Adicione o primeiro bloco abaixo.</p>
      )}

      <div className="relative mt-2">
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          + Adicionar bloco <span className="ml-1 text-xs text-slate-400">(ou tecle /)</span>
        </button>
        {menuOpen && (
          <InsertMenu
            onPick={(t) => {
              insertBlock(t)
              setMenuOpen(false)
            }}
            onClose={() => setMenuOpen(false)}
          />
        )}
      </div>
    </div>
  )
}
