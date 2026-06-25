import { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, ChevronUp, ChevronDown, Copy, Trash2, Plus } from 'lucide-react'
import type { Block } from '@/types/blocks'
import { useReportsStore } from '@/store/reportsStore'
import BlockBody from '@/components/blocks/BlockBody'
import InsertMenu from '@/components/blocks/InsertMenu'

const iconBtn =
  'flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700'

export default function BlockRow({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const moveBlock = useReportsStore((s) => s.moveBlock)
  const duplicateBlock = useReportsStore((s) => s.duplicateBlock)
  const deleteBlock = useReportsStore((s) => s.deleteBlock)
  const insertBlock = useReportsStore((s) => s.insertBlock)
  const updateBlock = useReportsStore((s) => s.updateBlock)
  const [menuOpen, setMenuOpen] = useState(false)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  // A calha (gutter) ocupa espaço sempre, então não há "vão" entre o bloco e
  // os ícones: o hover do grupo permanece ativo ao chegar nos botões.
  return (
    <div ref={setNodeRef} style={style} className="group flex gap-1">
      {/* Calha de ações à esquerda */}
      <div className="flex w-7 shrink-0 flex-col items-center gap-0.5 pt-3 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          {...attributes}
          {...listeners}
          title="Arrastar para reordenar"
          className={`${iconBtn} cursor-grab active:cursor-grabbing`}
        >
          <GripVertical className="h-4 w-4" />
        </button>
        <button onClick={() => moveBlock(block.id, 'up')} title="Mover para cima" className={iconBtn}>
          <ChevronUp className="h-4 w-4" />
        </button>
        <button onClick={() => moveBlock(block.id, 'down')} title="Mover para baixo" className={iconBtn}>
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {/* Corpo do bloco */}
      <div className="relative min-w-0 flex-1">
        {/* Ações à direita */}
        <div className="absolute right-2 top-2 z-10 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
          <button onClick={() => duplicateBlock(block.id)} title="Duplicar" className={iconBtn}>
            <Copy className="h-4 w-4" />
          </button>
          <button
            onClick={() => deleteBlock(block.id)}
            title="Excluir"
            className={`${iconBtn} hover:bg-red-50 hover:text-red-600`}
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div className="rounded-lg border border-transparent p-3 transition-colors hover:border-slate-200 hover:bg-white">
          <BlockBody block={block} update={(patch) => updateBlock(block.id, patch)} />
        </div>

        {/* Inserir abaixo */}
        <div className="relative flex justify-center py-0.5">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            title="Inserir bloco abaixo"
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-0.5 text-xs text-slate-400 opacity-0 transition-opacity hover:text-slate-700 group-hover:opacity-100"
          >
            <Plus className="h-3 w-3" /> inserir
          </button>
          {menuOpen && (
            <InsertMenu
              align="center"
              onPick={(t) => {
                insertBlock(t, block.id)
                setMenuOpen(false)
              }}
              onClose={() => setMenuOpen(false)}
            />
          )}
        </div>
      </div>
    </div>
  )
}
