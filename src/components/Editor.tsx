import { useEffect, useRef } from 'react'
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
import { useUiStore } from '@/store/uiStore'
import BlockRow from '@/components/blocks/BlockRow'

export default function Editor({ readOnly = false }: { readOnly?: boolean }) {
  const current = useReportsStore((s) => s.current)
  const reorderBlocks = useReportsStore((s) => s.reorderBlocks)
  const saveCurrent = useReportsStore((s) => s.saveCurrent)
  const openBlocksPanel = useUiStore((s) => s.openBlocksPanel)

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

  // ---- Atalho "/" abre o painel de blocos na sidebar (quando não estiver digitando) ----
  useEffect(() => {
    if (readOnly) return
    const onKey = (e: KeyboardEvent) => {
      const el = document.activeElement
      const typing = el && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName)
      if (e.key === '/' && !typing) {
        e.preventDefault()
        openBlocksPanel()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [readOnly, openBlocksPanel])

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
          Nenhum bloco ainda. Abra “Inserir bloco” na barra lateral (ou tecle /) para começar.
        </p>
      )}
    </div>
  )
}