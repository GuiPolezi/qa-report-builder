import type { StatusValue } from '@/types/blocks'
import { STATUS_META } from '@/types/blocks'

const base =
  'w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200'

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${base} ${props.className ?? ''}`} />
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${base} resize-y ${props.className ?? ''}`} />
}

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-slate-500">{label}</span>
      {children}
    </label>
  )
}

const STATUS_ORDER: StatusValue[] = ['success', 'problem', 'untested', 'partial']

export function StatusSelect({
  value,
  onChange,
}: {
  value: StatusValue
  onChange: (v: StatusValue) => void
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: STATUS_META[value].color }}
      />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as StatusValue)}
        className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs outline-none focus:border-slate-500"
      >
        {STATUS_ORDER.map((s) => (
          <option key={s} value={s}>
            {STATUS_META[s].label}
          </option>
        ))}
      </select>
    </span>
  )
}

export function StatusBadge({ value }: { value: StatusValue }) {
  const m = STATUS_META[value]
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium"
      style={{ backgroundColor: `${m.color}1a`, color: m.color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: m.color }} />
      {m.label}
    </span>
  )
}
