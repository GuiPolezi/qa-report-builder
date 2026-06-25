import { useEffect, useState } from 'react'
import type { Block, Report } from '@/types/blocks'
import { STATUS_META } from '@/types/blocks'
import { getSignedUrl } from '@/lib/storage'

function RenderImage({ path, caption }: { path: string; caption?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    if (path) void getSignedUrl(path).then((u) => active && setUrl(u))
    return () => {
      active = false
    }
  }, [path])
  if (!url) return null
  return (
    <figure className="my-2">
      <img src={url} alt={caption ?? ''} className="max-w-full rounded border border-slate-200" />
      {caption && <figcaption className="mt-1 text-xs text-slate-500">{caption}</figcaption>}
    </figure>
  )
}

function RenderBlock({ block }: { block: Block }) {
  switch (block.type) {
    case 'report-header': {
      const rows: [string, string][] = [
        ['Cliente', block.client],
        ['URL do site', block.siteUrl],
        ['Data de início', block.startDate],
        ['Data de término', block.endDate ?? ''],
        ['Versão do site', block.siteVersion],
        ['Navegador', block.browser],
        ['Técnico', block.technician],
      ].filter(([, v]) => v) as [string, string][]
      return (
        <table className="my-3 w-full border-collapse text-sm">
          <tbody>
            {rows.map(([k, v]) => (
              <tr key={k}>
                <td className="w-40 border border-slate-200 bg-slate-50 px-3 py-1.5 font-medium text-slate-600">{k}</td>
                <td className="border border-slate-200 px-3 py-1.5 text-slate-800">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )
    }
    case 'legend':
      return (
        <div className="my-2 flex flex-wrap gap-3">
          {block.items.map((it, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 text-sm">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: STATUS_META[it.status].color }} />
              {it.label}
            </span>
          ))}
        </div>
      )
    case 'heading': {
      const cls =
        block.level === 1 ? 'text-2xl font-bold' : block.level === 2 ? 'text-xl font-semibold' : 'text-lg font-semibold'
      return <p className={`mt-4 mb-1 text-slate-900 ${cls}`}>{block.text}</p>
    }
    case 'step':
      return (
        <p className="mt-3 mb-1 font-semibold text-slate-900">
          <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-xs text-white">
            {block.number}
          </span>
          {block.title}
        </p>
      )
    case 'divider':
      return <hr className="my-3 border-slate-300" />
    case 'status-item':
      return (
        <div className="my-1">
          <span className="font-medium" style={{ color: STATUS_META[block.status].color }}>
            ● {block.label}
          </span>
          {block.description && <span className="text-slate-600"> — {block.description}</span>}
        </div>
      )
    case 'page-card':
      return (
        <div className="my-2 rounded-lg border border-slate-200 p-3">
          <p className="font-semibold text-slate-900">{block.name}</p>
          {block.url && <p className="text-xs text-slate-500">{block.url}</p>}
          <ul className="mt-1.5 space-y-1">
            {block.findings.map((f, i) => (
              <li key={i} className="text-sm">
                <span className="font-medium" style={{ color: STATUS_META[f.status].color }}>
                  ● {f.label}
                </span>
                {f.description && <span className="text-slate-600"> — {f.description}</span>}
              </li>
            ))}
          </ul>
        </div>
      )
    case 'paragraph':
      return (
        <p
          className="my-2 whitespace-pre-wrap text-slate-800"
          style={block.color ? { color: STATUS_META[block.color].color } : undefined}
        >
          {block.text}
        </p>
      )
    case 'checklist':
      return (
        <ul className="my-2 space-y-1">
          {block.items.map((it, i) => (
            <li key={i} className="text-sm text-slate-800">
              {it.done ? '☑' : '☐'} <span className={it.done ? 'line-through text-slate-400' : ''}>{it.text}</span>
            </li>
          ))}
        </ul>
      )
    case 'device-test':
      return (
        <div className="my-2">
          <p className="font-medium text-slate-900">{block.pageName}</p>
          {block.url && <p className="text-xs text-slate-500">{block.url}</p>}
          <ul className="mt-1 space-y-0.5">
            {block.devices.map((d, i) => (
              <li key={i} className="text-sm">
                {d.label}:{' '}
                <span className="font-medium" style={{ color: STATUS_META[d.status].color }}>
                  {STATUS_META[d.status].label}
                </span>
                {d.notes && <span className="text-slate-600"> — {d.notes}</span>}
              </li>
            ))}
          </ul>
        </div>
      )
    case 'image':
      return <RenderImage path={block.storagePath} caption={block.caption} />
    case 'link':
      return (
        <p className="my-1 text-sm">
          <a href={block.url} className="text-blue-600 underline">
            {block.label || block.url}
          </a>
        </p>
      )
    case 'video':
      return (
        <p className="my-1 text-sm">
          🎬{' '}
          <a href={block.url} className="text-blue-600 underline">
            {block.label || block.url}
          </a>
        </p>
      )
    case 'callout': {
      const titleMap = { note: 'Nota', warning: 'Atenção', conclusion: 'Conclusão' }
      return (
        <div className="my-2 rounded-lg border-l-4 border-slate-400 bg-slate-50 px-3 py-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {block.title || titleMap[block.variant]}
          </p>
          <p className="whitespace-pre-wrap text-sm text-slate-800">{block.text}</p>
        </div>
      )
    }
    case 'table':
      return (
        <table className="my-2 w-full border-collapse text-sm">
          <thead>
            <tr>
              {block.headers.map((h, i) => (
                <th key={i} className="border border-slate-200 bg-slate-50 px-2 py-1 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {block.rows.map((row, ri) => (
              <tr key={ri}>
                {row.map((cell, ci) => (
                  <td key={ci} className="border border-slate-200 px-2 py-1">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )
  }
}

export default function ReportRender({ report }: { report: Report }) {
  return (
    <div className="report-render mx-auto max-w-3xl bg-white p-8 text-slate-900">
      <h1 className="mb-4 text-3xl font-bold">{report.title}</h1>
      {report.blocks.map((b) => (
        <RenderBlock key={b.id} block={b} />
      ))}
    </div>
  )
}
