import type {
  Block,
  ChecklistBlock,
  DeviceTestBlock,
  LegendBlock,
  PageCardBlock,
  PageFinding,
  StatusValue,
  TableBlock,
} from '@/types/blocks'
import { STATUS_META } from '@/types/blocks'
import { Field, StatusSelect, TextArea, TextInput } from '@/components/ui/Inputs'
import ImageBlockEditor from '@/components/blocks/editors/ImageBlockEditor'

interface Props {
  block: Block
  update: (patch: Partial<Block>) => void
}

export default function BlockBody({ block, update }: Props) {
  switch (block.type) {
    // ---------------- Cabeçalho do relatório ----------------
    case 'report-header':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Cliente">
            <TextInput value={block.client} onChange={(e) => update({ client: e.target.value })} />
          </Field>
          <Field label="URL do site">
            <TextInput value={block.siteUrl} onChange={(e) => update({ siteUrl: e.target.value })} />
          </Field>
          <Field label="Data de início">
            <TextInput type="date" value={block.startDate} onChange={(e) => update({ startDate: e.target.value })} />
          </Field>
          <Field label="Data de término">
            <TextInput type="date" value={block.endDate ?? ''} onChange={(e) => update({ endDate: e.target.value })} />
          </Field>
          <Field label="Versão do site">
            <TextInput value={block.siteVersion} onChange={(e) => update({ siteVersion: e.target.value })} />
          </Field>
          <Field label="Navegador">
            <TextInput value={block.browser} onChange={(e) => update({ browser: e.target.value })} />
          </Field>
          <Field label="Técnico responsável">
            <TextInput value={block.technician} onChange={(e) => update({ technician: e.target.value })} />
          </Field>
        </div>
      )

    // ---------------- Legenda ----------------
    case 'legend': {
      const b = block as LegendBlock
      const setItem = (i: number, status: StatusValue) => {
        const items = b.items.map((it, idx) => (idx === i ? { ...it, status, label: STATUS_META[status].label } : it))
        update({ items })
      }
      return (
        <div>
          <p className="mb-2 text-xs font-medium text-slate-500">Legenda de status</p>
          <div className="flex flex-wrap gap-3">
            {b.items.map((it, i) => (
              <StatusSelect key={i} value={it.status} onChange={(s) => setItem(i, s)} />
            ))}
          </div>
        </div>
      )
    }

    // ---------------- Título de seção ----------------
    case 'heading':
      return (
        <div className="flex items-center gap-2">
          <select
            value={block.level}
            onChange={(e) => update({ level: Number(e.target.value) as 1 | 2 | 3 })}
            className="rounded-md border border-slate-300 px-2 py-1 text-xs"
          >
            <option value={1}>H1</option>
            <option value={2}>H2</option>
            <option value={3}>H3</option>
          </select>
          <TextInput
            value={block.text}
            placeholder="Título da seção"
            onChange={(e) => update({ text: e.target.value })}
            className={block.level === 1 ? 'text-xl font-bold' : block.level === 2 ? 'text-lg font-semibold' : 'font-medium'}
          />
        </div>
      )

    // ---------------- Etapa numerada ----------------
    case 'step':
      return (
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
            <input
              type="number"
              min={1}
              value={block.number}
              onChange={(e) => update({ number: Number(e.target.value) })}
              className="w-7 bg-transparent text-center outline-none"
            />
          </span>
          <TextInput value={block.title} placeholder="Título da etapa" onChange={(e) => update({ title: e.target.value })} />
        </div>
      )

    // ---------------- Divisor ----------------
    case 'divider':
      return <hr className="border-slate-300" />

    // ---------------- Item de verificação ----------------
    case 'status-item':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <StatusSelect value={block.status} onChange={(s) => update({ status: s })} />
            <TextInput
              value={block.label}
              placeholder="Item testado"
              onChange={(e) => update({ label: e.target.value })}
              style={{ color: STATUS_META[block.status].color, fontWeight: 500 }}
            />
          </div>
          <TextArea
            rows={2}
            value={block.description ?? ''}
            placeholder="Observação (opcional)"
            onChange={(e) => update({ description: e.target.value })}
          />
        </div>
      )

    // ---------------- Página/menu testado ----------------
    case 'page-card': {
      const b = block as PageCardBlock
      const setFinding = (i: number, patch: Partial<PageFinding>) =>
        update({ findings: b.findings.map((f, idx) => (idx === i ? { ...f, ...patch } : f)) })
      const addFinding = () =>
        update({ findings: [...b.findings, { label: '', status: 'untested', description: '' }] })
      const removeFinding = (i: number) => update({ findings: b.findings.filter((_, idx) => idx !== i) })
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Página / Menu">
              <TextInput value={b.name} onChange={(e) => update({ name: e.target.value })} />
            </Field>
            <Field label="URL">
              <TextInput value={b.url ?? ''} onChange={(e) => update({ url: e.target.value })} />
            </Field>
          </div>
          <div className="space-y-2">
            {b.findings.map((f, i) => (
              <div key={i} className="rounded-md border border-slate-200 p-2">
                <div className="flex items-center gap-2">
                  <StatusSelect value={f.status} onChange={(s) => setFinding(i, { status: s })} />
                  <TextInput
                    value={f.label}
                    placeholder="Item"
                    onChange={(e) => setFinding(i, { label: e.target.value })}
                    style={{ color: STATUS_META[f.status].color, fontWeight: 500 }}
                  />
                  <button onClick={() => removeFinding(i)} className="shrink-0 rounded p-1 text-slate-400 hover:text-red-600">✕</button>
                </div>
                <TextArea
                  rows={1}
                  value={f.description ?? ''}
                  placeholder="Observação"
                  onChange={(e) => setFinding(i, { description: e.target.value })}
                  className="mt-2"
                />
              </div>
            ))}
            <button onClick={addFinding} className="text-xs font-medium text-slate-600 hover:text-slate-900">
              + Adicionar item
            </button>
          </div>
        </div>
      )
    }

    // ---------------- Parágrafo ----------------
    case 'paragraph': {
      const colorVal = block.color ? STATUS_META[block.color].color : undefined
      const swatches: (StatusValue | 'none')[] = ['none', 'success', 'problem', 'untested', 'partial']
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Cor do texto:</span>
            {swatches.map((s) => {
              const active = (block.color ?? 'none') === s
              const c = s === 'none' ? '#0f172a' : STATUS_META[s].color
              return (
                <button
                  key={s}
                  title={s === 'none' ? 'Padrão' : STATUS_META[s].label}
                  onClick={() => update({ color: s === 'none' ? undefined : s })}
                  className={`h-5 w-5 rounded-full border-2 ${active ? 'border-slate-800' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              )
            })}
          </div>
          <TextArea
            rows={3}
            value={block.text}
            placeholder="Escreva aqui…"
            onChange={(e) => update({ text: e.target.value })}
            style={colorVal ? { color: colorVal, fontWeight: 500 } : undefined}
          />
        </div>
      )
    }

    // ---------------- Checklist ----------------
    case 'checklist': {
      const b = block as ChecklistBlock
      const setItem = (i: number, patch: Partial<{ text: string; done: boolean }>) =>
        update({ items: b.items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) })
      return (
        <div className="space-y-1.5">
          {b.items.map((it, i) => (
            <div key={i} className="flex items-center gap-2">
              <input type="checkbox" checked={it.done} onChange={(e) => setItem(i, { done: e.target.checked })} className="h-4 w-4" />
              <TextInput
                value={it.text}
                placeholder="Tarefa"
                onChange={(e) => setItem(i, { text: e.target.value })}
                className={it.done ? 'line-through text-slate-400' : ''}
              />
              <button onClick={() => update({ items: b.items.filter((_, idx) => idx !== i) })} className="shrink-0 rounded p-1 text-slate-400 hover:text-red-600">✕</button>
            </div>
          ))}
          <button onClick={() => update({ items: [...b.items, { text: '', done: false }] })} className="text-xs font-medium text-slate-600 hover:text-slate-900">
            + Adicionar tarefa
          </button>
        </div>
      )
    }

    // ---------------- Teste multi-dispositivo ----------------
    case 'device-test': {
      const b = block as DeviceTestBlock
      const setDevice = (i: number, patch: Partial<DeviceTestBlock['devices'][number]>) =>
        update({ devices: b.devices.map((d, idx) => (idx === i ? { ...d, ...patch } : d)) })
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Página">
              <TextInput value={b.pageName} onChange={(e) => update({ pageName: e.target.value })} />
            </Field>
            <Field label="URL">
              <TextInput value={b.url ?? ''} onChange={(e) => update({ url: e.target.value })} />
            </Field>
          </div>
          <div className="space-y-2">
            {b.devices.map((d, i) => (
              <div key={i} className="flex items-center gap-2 rounded-md border border-slate-200 p-2">
                <TextInput
                  value={d.label}
                  placeholder="Dispositivo"
                  onChange={(e) => setDevice(i, { label: e.target.value })}
                  className="max-w-[140px]"
                  style={{ color: STATUS_META[d.status].color, fontWeight: 500 }}
                />
                <StatusSelect value={d.status} onChange={(s) => setDevice(i, { status: s })} />
                <TextInput value={d.notes ?? ''} placeholder="Notas" onChange={(e) => setDevice(i, { notes: e.target.value })} />
                <button onClick={() => update({ devices: b.devices.filter((_, idx) => idx !== i) })} className="shrink-0 rounded p-1 text-slate-400 hover:text-red-600">✕</button>
              </div>
            ))}
            <button onClick={() => update({ devices: [...b.devices, { device: 'custom', label: '', status: 'untested' }] })} className="text-xs font-medium text-slate-600 hover:text-slate-900">
              + Adicionar dispositivo
            </button>
          </div>
        </div>
      )
    }

    // ---------------- Link ----------------
    case 'link':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="URL">
            <TextInput value={block.url} placeholder="https://…" onChange={(e) => update({ url: e.target.value })} />
          </Field>
          <Field label="Rótulo (opcional)">
            <TextInput value={block.label ?? ''} onChange={(e) => update({ label: e.target.value })} />
          </Field>
        </div>
      )

    // ---------------- Vídeo ----------------
    case 'video':
      return (
        <div className="grid grid-cols-2 gap-3">
          <Field label="URL do vídeo">
            <TextInput value={block.url} placeholder="https://…" onChange={(e) => update({ url: e.target.value })} />
          </Field>
          <Field label="Rótulo (opcional)">
            <TextInput value={block.label ?? ''} onChange={(e) => update({ label: e.target.value })} />
          </Field>
        </div>
      )

    // ---------------- Nota / callout ----------------
    case 'callout':
      return (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <select
              value={block.variant}
              onChange={(e) => update({ variant: e.target.value as 'note' | 'warning' | 'conclusion' })}
              className="rounded-md border border-slate-300 px-2 py-1 text-xs"
            >
              <option value="note">Nota</option>
              <option value="warning">Atenção</option>
              <option value="conclusion">Conclusão</option>
            </select>
            <TextInput value={block.title ?? ''} placeholder="Título (opcional)" onChange={(e) => update({ title: e.target.value })} />
          </div>
          <TextArea rows={3} value={block.text} placeholder="Texto da nota" onChange={(e) => update({ text: e.target.value })} />
        </div>
      )

    // ---------------- Tabela ----------------
    case 'table': {
      const b = block as TableBlock
      const setHeader = (i: number, v: string) => update({ headers: b.headers.map((h, idx) => (idx === i ? v : h)) })
      const setCell = (r: number, c: number, v: string) =>
        update({ rows: b.rows.map((row, ri) => (ri === r ? row.map((cell, ci) => (ci === c ? v : cell)) : row)) })
      const addRow = () => update({ rows: [...b.rows, b.headers.map(() => '')] })
      const addCol = () => update({ headers: [...b.headers, `Coluna ${b.headers.length + 1}`], rows: b.rows.map((r) => [...r, '']) })
      return (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                {b.headers.map((h, i) => (
                  <th key={i} className="border border-slate-200 p-1">
                    <TextInput value={h} onChange={(e) => setHeader(i, e.target.value)} className="font-semibold" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci} className="border border-slate-200 p-1">
                      <TextInput value={cell} onChange={(e) => setCell(ri, ci, e.target.value)} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-2 flex gap-3">
            <button onClick={addRow} className="text-xs font-medium text-slate-600 hover:text-slate-900">+ Linha</button>
            <button onClick={addCol} className="text-xs font-medium text-slate-600 hover:text-slate-900">+ Coluna</button>
          </div>
        </div>
      )
    }

    // ---------------- Imagem ----------------
    case 'image':
      return <ImageBlockEditor block={block} update={update} />
  }
}
