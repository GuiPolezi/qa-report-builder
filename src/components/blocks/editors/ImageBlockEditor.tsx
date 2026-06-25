import { useEffect, useRef, useState } from 'react'
import { ImagePlus, Trash2, Loader2 } from 'lucide-react'
import type { ImageBlock } from '@/types/blocks'
import { useReportsStore } from '@/store/reportsStore'
import { useAuthStore } from '@/store/authStore'
import { uploadReportImage, getSignedUrl, deleteReportImage } from '@/lib/storage'
import { TextInput } from '@/components/ui/Inputs'

export default function ImageBlockEditor({
  block,
  update,
}: {
  block: ImageBlock
  update: (patch: Partial<ImageBlock>) => void
}) {
  const reportId = useReportsStore((s) => s.current?.id)
  const userId = useAuthStore((s) => s.user?.id)
  const [url, setUrl] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Resolve a URL assinada sempre que o path mudar
  useEffect(() => {
    let active = true
    if (block.storagePath) {
      void getSignedUrl(block.storagePath).then((u) => active && setUrl(u))
    } else {
      setUrl(null)
    }
    return () => {
      active = false
    }
  }, [block.storagePath])

  const handleFile = async (file: File | null | undefined) => {
    if (!file || !reportId || !userId) return
    if (!file.type.startsWith('image/')) {
      setError('Selecione um arquivo de imagem.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const previous = block.storagePath
      const path = await uploadReportImage(file, reportId, userId)
      update({ storagePath: path })
      if (previous) void deleteReportImage(previous) // limpa a anterior ao trocar
    } catch (e) {
      setError('Falha no upload. Verifique sua conexão e permissões.')
      console.error(e)
    } finally {
      setBusy(false)
    }
  }

  const onPaste = (e: React.ClipboardEvent) => {
    const item = Array.from(e.clipboardData.items).find((i) => i.type.startsWith('image/'))
    if (item) {
      e.preventDefault()
      void handleFile(item.getAsFile())
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    void handleFile(e.dataTransfer.files?.[0])
  }

  const onRemove = () => {
    if (block.storagePath) void deleteReportImage(block.storagePath)
    update({ storagePath: '' })
  }

  // Já tem imagem
  if (block.storagePath && url) {
    return (
      <div className="space-y-2">
        <div className="group/img relative inline-block">
          <img src={url} alt={block.caption ?? ''} className="max-h-96 rounded-lg border border-slate-200" />
          <button
            onClick={onRemove}
            title="Remover imagem"
            className="absolute right-2 top-2 rounded-md bg-white/90 p-1.5 text-slate-500 opacity-0 shadow hover:text-red-600 group-hover/img:opacity-100"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
        <TextInput
          value={block.caption ?? ''}
          placeholder="Legenda da imagem (opcional)"
          onChange={(e) => update({ caption: e.target.value })}
        />
      </div>
    )
  }

  // Sem imagem: área para enviar / colar / arrastar
  return (
    <div>
      <div
        tabIndex={0}
        onPaste={onPaste}
        onDrop={onDrop}
        onDragOver={(e) => e.preventDefault()}
        className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center outline-none transition-colors hover:border-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
      >
        {busy ? (
          <>
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            <span className="text-sm text-slate-500">Enviando…</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-6 w-6 text-slate-400" />
            <span className="text-sm font-medium text-slate-600">Arraste, cole (Ctrl+V) ou envie um print</span>
            <span className="text-xs text-slate-400">Clique nesta área e cole, solte um arquivo, ou</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                inputRef.current?.click()
              }}
              className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              Procurar arquivo
            </button>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => void handleFile(e.target.files?.[0])}
      />
    </div>
  )
}
