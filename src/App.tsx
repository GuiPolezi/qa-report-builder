import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type ConnState = 'checking' | 'ok' | 'no-env' | 'error'

export default function App() {
  const [state, setState] = useState<ConnState>('checking')
  const [detail, setDetail] = useState('')

  useEffect(() => {
    const url = import.meta.env.VITE_SUPABASE_URL
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY
    if (!url || !key) {
      setState('no-env')
      return
    }
    // getSession() valida o cliente sem exigir login.
    supabase.auth
      .getSession()
      .then(({ error }) => {
        if (error) {
          setState('error')
          setDetail(error.message)
        } else {
          setState('ok')
        }
      })
      .catch((e) => {
        setState('error')
        setDetail(String(e?.message ?? e))
      })
  }, [])

  const badge = {
    checking: { text: 'Verificando conexão…', cls: 'bg-amber-100 text-amber-800' },
    ok: { text: 'Conectado ao Supabase', cls: 'bg-green-100 text-green-800' },
    'no-env': { text: 'Variáveis de ambiente ausentes', cls: 'bg-red-100 text-red-800' },
    error: { text: 'Erro ao conectar', cls: 'bg-red-100 text-red-800' },
  }[state]

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">QA Report Builder</h1>
        <p className="mt-1 text-sm text-slate-500">Fundação do projeto (Parte 0)</p>

        <div className={`mt-6 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${badge.cls}`}>
          <span className="h-2 w-2 rounded-full bg-current opacity-70" />
          {badge.text}
        </div>

        {state === 'no-env' && (
          <p className="mt-4 text-sm text-slate-600">
            Copie <code className="rounded bg-slate-100 px-1">.env.example</code> para{' '}
            <code className="rounded bg-slate-100 px-1">.env</code> e preencha a URL e a chave anon do seu
            projeto Supabase.
          </p>
        )}
        {state === 'error' && <p className="mt-4 text-sm text-red-600">{detail}</p>}

        <ul className="mt-6 space-y-1 text-sm text-slate-600">
          <li>✓ React 19 + Vite + TypeScript</li>
          <li>✓ Tailwind CSS v4</li>
          <li>✓ Cliente Supabase</li>
          <li>✓ Zustand + React Router (prontos para a Parte 2)</li>
        </ul>
      </div>
    </div>
  )
}
