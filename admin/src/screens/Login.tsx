import React from 'react'
import { useState } from 'react'
import { useAuth } from '../auth'
import { ApiError } from '../api/resources'
import { ErrorBox } from '../components/ui'

export default function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (busy) return
    setBusy(true)
    setError('')
    try {
      await login(username.trim(), password)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('No se pudo conectar con el servidor')
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-charcoal">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-mora to-charcoal text-4xl mb-3">
            🥬
          </div>
          <h1 className="font-heading font-black text-sand text-2xl">
            Mora Verduras
          </h1>
          <p className="text-sand/50 text-sm mt-1">Panel de administración</p>
        </div>

        <form
          onSubmit={submit}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-xs font-heading font-bold uppercase tracking-wide text-sand/60 mb-1.5">
              Usuario
            </span>
            <input
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="admin"
              autoComplete="username"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-sand placeholder:text-sand/40 text-sm border border-white/10 focus:border-mora focus:outline-none"
            />
          </label>

          <label className="block">
            <span className="block text-xs font-heading font-bold uppercase tracking-wide text-sand/60 mb-1.5">
              Contraseña
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              className="w-full px-3 py-2.5 rounded-xl bg-white/10 text-sand placeholder:text-sand/40 text-sm border border-white/10 focus:border-mora focus:outline-none"
            />
          </label>

          <ErrorBox message={error} />

          <button
            type="submit"
            disabled={busy}
            className="w-full py-3 rounded-xl bg-mora hover:bg-mora-dark text-white font-heading font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-60"
          >
            {busy ? 'Entrando…' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  )
}