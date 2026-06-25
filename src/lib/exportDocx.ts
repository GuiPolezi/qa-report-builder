import {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  Table, TableRow, TableCell, WidthType, ImageRun, ExternalHyperlink, BorderStyle,
} from 'docx'
import type { Block, Report, StatusValue } from '@/types/blocks'
import { STATUS_META } from '@/types/blocks'
import { getSignedUrl } from '@/lib/storage'
import { summarizeStatuses } from '@/lib/statusSummary'

type ImgType = 'png' | 'jpg' | 'gif' | 'bmp'
interface FetchedImage { data: Uint8Array; width: number; height: number; type: ImgType }

const hex = (s: StatusValue) => STATUS_META[s].color.replace('#', '')

function imgTypeFromPath(path: string): ImgType {
  const ext = path.split('.').pop()?.toLowerCase()
  if (ext === 'jpg' || ext === 'jpeg') return 'jpg'
  if (ext === 'gif') return 'gif'
  if (ext === 'bmp') return 'bmp'
  return 'png'
}

function imageSize(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => {
      const maxW = 480
      const scale = img.naturalWidth > maxW ? maxW / img.naturalWidth : 1
      resolve({ width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale) })
    }
    img.onerror = () => resolve({ width: 400, height: 300 })
    img.src = url
  })
}

async function fetchImage(path: string): Promise<FetchedImage | null> {
  try {
    const url = await getSignedUrl(path)
    if (!url) return null
    const res = await fetch(url)
    const buf = await res.arrayBuffer()
    const { width, height } = await imageSize(url)
    return { data: new Uint8Array(buf), width, height, type: imgTypeFromPath(path) }
  } catch (e) {
    console.error('[docx] image fetch:', e)
    return null
  }
}

const HEADINGS = [HeadingLevel.HEADING_1, HeadingLevel.HEADING_2, HeadingLevel.HEADING_3]

function blockToElements(block: Block, images: Map<string, FetchedImage>): (Paragraph | Table)[] {
  switch (block.type) {
    case 'report-header': {
      const rows: [string, string][] = [
        ['Cliente', block.client], ['URL do site', block.siteUrl],
        ['Data de início', block.startDate], ['Data de término', block.endDate ?? ''],
        ['Versão do site', block.siteVersion], ['Navegador', block.browser],
        ['Técnico', block.technician],
      ]
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: rows
            .filter(([, v]) => v)
            .map(
              ([k, v]) =>
                new TableRow({
                  children: [
                    new TableCell({
                      width: { size: 30, type: WidthType.PERCENTAGE },
                      children: [new Paragraph({ children: [new TextRun({ text: k, bold: true })] })],
                    }),
                    new TableCell({ children: [new Paragraph(v)] }),
                  ],
                }),
            ),
        }),
        new Paragraph(''),
      ]
    }
    case 'legend':
      return [
        new Paragraph({
          children: block.items.flatMap((it) => [
            new TextRun({ text: '● ', color: hex(it.status), bold: true }),
            new TextRun({ text: `${it.label}    ` }),
          ]),
        }),
      ]
    case 'heading':
      return [new Paragraph({ heading: HEADINGS[block.level - 1], children: [new TextRun({ text: block.text })] })]
    case 'step':
      return [new Paragraph({ children: [new TextRun({ text: `${block.number}. ${block.title}`, bold: true })] })]
    case 'divider':
      return [new Paragraph({ border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'CCCCCC' } } })]
    case 'status-item':
      return [
        new Paragraph({
          children: [
            new TextRun({ text: `● ${block.label}`, color: hex(block.status), bold: true }),
            ...(block.description ? [new TextRun({ text: ` — ${block.description}` })] : []),
          ],
        }),
      ]
    case 'page-card':
      return [
        new Paragraph({ children: [new TextRun({ text: block.name, bold: true })] }),
        ...(block.url ? [new Paragraph({ children: [new TextRun({ text: block.url, size: 18, color: '888888' })] })] : []),
        ...block.findings.map(
          (f) =>
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: f.label, color: hex(f.status), bold: true }),
                ...(f.description ? [new TextRun({ text: ` — ${f.description}` })] : []),
              ],
            }),
        ),
      ]
    case 'paragraph':
      return [
        new Paragraph({
          children: [new TextRun({ text: block.text, ...(block.color ? { color: hex(block.color) } : {}) })],
        }),
      ]
    case 'checklist':
      return block.items.map(
        (it) => new Paragraph({ children: [new TextRun({ text: `${it.done ? '☑' : '☐'} ${it.text}` })] }),
      )
    case 'device-test':
      return [
        new Paragraph({ children: [new TextRun({ text: block.pageName, bold: true })] }),
        ...block.devices.map(
          (d) =>
            new Paragraph({
              bullet: { level: 0 },
              children: [
                new TextRun({ text: `${d.label}: ` }),
                new TextRun({ text: STATUS_META[d.status].label, color: hex(d.status), bold: true }),
                ...(d.notes ? [new TextRun({ text: ` — ${d.notes}` })] : []),
              ],
            }),
        ),
      ]
    case 'image': {
      const img = images.get(block.id)
      if (!img) return [new Paragraph({ children: [new TextRun({ text: '[imagem]', italics: true, color: '888888' })] })]
      return [
        new Paragraph({
          children: [
            new ImageRun({ type: img.type, data: img.data, transformation: { width: img.width, height: img.height } }),
          ],
        }),
        ...(block.caption ? [new Paragraph({ children: [new TextRun({ text: block.caption, italics: true, size: 18 })] })] : []),
      ]
    }
    case 'link':
    case 'video':
      return [
        new Paragraph({
          children: [
            new ExternalHyperlink({
              link: block.url,
              children: [new TextRun({ text: block.label || block.url, color: '1155CC', underline: {} })],
            }),
          ],
        }),
      ]
    case 'callout': {
      const titleMap = { note: 'Nota', warning: 'Atenção', conclusion: 'Conclusão' }
      return [
        new Paragraph({ children: [new TextRun({ text: (block.title || titleMap[block.variant]).toUpperCase(), bold: true })] }),
        new Paragraph({ children: [new TextRun({ text: block.text })] }),
      ]
    }
    case 'table':
      return [
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: [
            new TableRow({
              tableHeader: true,
              children: block.headers.map(
                (h) => new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: h, bold: true })] })] }),
              ),
            }),
            ...block.rows.map(
              (row) =>
                new TableRow({ children: row.map((c) => new TableCell({ children: [new Paragraph(c)] })) }),
            ),
          ],
        }),
        new Paragraph(''),
      ]
  }
}

export async function exportReportToDocx(report: Report): Promise<void> {
  // Pré-carrega as imagens (bytes + dimensões)
  const images = new Map<string, FetchedImage>()
  for (const b of report.blocks) {
    if (b.type === 'image' && b.storagePath) {
      const img = await fetchImage(b.storagePath)
      if (img) images.set(b.id, img)
    }
  }

  const children: (Paragraph | Table)[] = [
    new Paragraph({ heading: HeadingLevel.TITLE, children: [new TextRun({ text: report.title })] }),
  ]

  // Linha de resumo (contagem por status, conforme a legenda)
  const summary = summarizeStatuses(report.blocks)
  if (summary.total > 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `Resumo (${summary.total} itens):  `, bold: true }),
          ...summary.display.flatMap((s) => [
            new TextRun({ text: '● ', color: hex(s), bold: true }),
            new TextRun({ text: `${STATUS_META[s].label}: ${summary.counts[s]}    ` }),
          ]),
        ],
      }),
    )
  }

  for (const b of report.blocks) children.push(...blockToElements(b, images))

  const doc = new Document({ sections: [{ children }] })
  const blob = await Packer.toBlob(doc)

  const safe = report.title.replace(/[^\p{L}\p{N}\- ]/gu, '').trim() || 'relatorio'
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${safe}.docx`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}