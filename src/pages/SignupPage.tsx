import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { AuthShell, Field, traduzErro } from '@/pages/LoginPage'

export default function SignupPage() {
  const navigate = useNavigate()
  const signUp = useAuthStore((s) => s.signUp)
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [busy, setBusy] = useState(false)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setInfo('')
    setBusy(true)
    const { error, needsConfirmation } = await signUp({ fullName, email, password })
    setBusy(false)
    if (error) {
      setError(traduzErro(error))
      return
    }
    if (needsConfirmation) {
      setInfo('Conta criada. Verifique seu e-mail para confirmar o cadastro antes de entrar.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <AuthShell title="Criar conta" subtitle="Comece a montar seus relatórios">
      <form onSubmit={onSubmit} className="space-y-4">
        <Field label="Nome completo" type="text" value={fullName} onChange={setFullName} autoComplete="name" />
        <Field label="E-mail" type="email" value={email} onChange={setEmail} autoComplete="email" />
        <Field label="Senha" type="password" value={password} onChange={setPassword} autoComplete="new-password" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        {info && <p className="text-sm text-green-700">{info}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
        >
          {busy ? 'Criando…' : 'Criar conta'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500">
        Já tem conta?{' '}
        <Link to="/login" className="font-medium text-slate-900 hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  )
}
