// @ts-expect-error: o build de navegador do mammoth não traz tipos
import mammoth from 'mammoth/mammoth.browser'
import type { Block } from '@/types/blocks'

const uid = () =>
  globalThis.crypto?.randomUUID?.() ?? 'b_' + Math.random().toString(36).slice(2) + Date.now().toString(36)

export interface PendingImage {
  blockId: string
  dataUrl: string
}

export interface ParsedDoc {
  title: string
  blocks: Block[]
  images: PendingImage[]
}

function headingLevel(tag: string): 1 | 2 | 3 {
  if (tag === 'h1') return 1
  if (tag === 'h2') return 2
  return 3
}

// Converte um .docx em blocos do nosso editor.
export async function parseDocx(arrayBuffer: ArrayBuffer, fallbackTitle: string): Promise<ParsedDoc> {
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const html: string = result.value
  const doc = new DOMParser().parseFromString(html, 'text/html')

  const blocks: Block[] = []
  const images: PendingImage[] = []
  let title = ''

  const pushImage = (src: string | null) => {
    if (!src || !src.startsWith('data:')) return
    const id = uid()
    blocks.push({ id, type: 'image', storagePath: '', caption: '' })
    images.push({ blockId: id, dataUrl: src })
  }

  for (const el of Array.from(doc.body.children)) {
    const tag = el.tagName.toLowerCase()

    if (tag === 'h1' || tag === 'h2' || tag === 'h3' || tag === 'h4' || tag === 'h5' || tag === 'h6') {
      const text = el.textContent?.trim() ?? ''
      if (!title && tag === 'h1') title = text
      if (text) blocks.push({ id: uid(), type: 'heading', level: headingLevel(tag), text })
      continue
    }

    if (tag === 'p') {
      const imgs = el.querySelectorAll('img')
      const text = el.textContent?.trim() ?? ''
      if (text) blocks.push({ id: uid(), type: 'paragraph', text })
      imgs.forEach((img) => pushImage(img.getAttribute('src')))
      continue
    }

    if (tag === 'ul' || tag === 'ol') {
      const items = Array.from(el.querySelectorAll(':scope > li')).map((li) => ({
        text: li.textContent?.trim() ?? '',
        done: false,
      }))
      if (items.length) blocks.push({ id: uid(), type: 'checklist', items })
      continue
    }

    if (tag === 'table') {
      const rows = Array.from(el.querySelectorAll('tr'))
      if (rows.length) {
        const cells = (tr: Element) =>
          Array.from(tr.querySelectorAll('th, td')).map((c) => c.textContent?.trim() ?? '')
        const headers = cells(rows[0])
        const body = rows.slice(1).map(cells)
        blocks.push({ id: uid(), type: 'table', headers: headers.length ? headers : ['Coluna 1'], rows: body })
      }
      continue
    }

    if (tag === 'img') {
      pushImage(el.getAttribute('src'))
      continue
    }

    if (tag === 'hr') {
      blocks.push({ id: uid(), type: 'divider' })
      continue
    }

    const text = el.textContent?.trim() ?? ''
    if (text) blocks.push({ id: uid(), type: 'paragraph', text })
  }

  return { title: title || fallbackTitle, blocks, images }
}

// Converte uma data URL (base64) em File para upload no Storage.
export function dataUrlToFile(dataUrl: string, name: string): File {
  const [meta, b64] = dataUrl.split(',')
  const mime = meta.match(/data:(.*?);/)?.[1] || 'image/png'
  const bin = atob(b64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i)
  const ext = mime.split('/')[1] || 'png'
  return new File([arr], `${name}.${ext}`, { type: mime })
}