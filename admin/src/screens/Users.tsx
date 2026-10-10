import { useEffect, useState } from 'react'
import { Plus, Pencil, List, LayoutGrid } from 'lucide-react'
import { userApi } from '../api/resources'
import type { AdminUser } from '../api/types'
import {
  ActionButton,
  EmptyState,
  ErrorBox,
  Field,
  Modal,
  Spinner,
  TextInput,
  Toggle,
} from '../components/ui'

export default function UsersScreen() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState<AdminUser | null>(null)
  const [enabled, setEditEnabled] = useState(true)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setUsers(await userApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    setBusy(true)
    setError('')
    try {
      await userApi.create(username.trim(), password)
      setModalOpen(false)
      setUsername('')
      setPassword('')
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear usuario')
    } finally {
      setBusy(false)
    }
  }

  const setEnabled = async (u: AdminUser, enabled: boolean) => {
    setError('')
    try {
      await userApi.setEnabled(u.id, enabled)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Usuarios</h1>
          <p className="text-sand/50 text-sm">Administradores con acceso a este panel.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div
            className="flex items-center rounded-xl border border-white/10 p-0.5 bg-white/5"
            role="group"
            aria-label="Modo de visualización"
          >
            <button
              type="button"
              onClick={() => setViewMode('list')}
              aria-label="Vista en lista"
              title="Vista en lista"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-mora text-white shadow-sm'
                  : 'text-sand/60 hover:text-sand'
              }`}
            >
              <List size={16} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              aria-label="Vista en cuadrícula"
              title="Vista en cuadrícula"
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-mora text-white shadow-sm'
                  : 'text-sand/60 hover:text-sand'
              }`}
            >
              <LayoutGrid size={16} />
            </button>
          </div>
          <ActionButton
            variant="primary"
            onClick={() => {
              setError('')
              setUsername('')
              setPassword('')
              setModalOpen(true)
            }}
          >
            <Plus size={14} /> Nuevo
          </ActionButton>
        </div>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Cargando usuarios…" />
      ) : users.length === 0 ? (
        <EmptyState message="Sin usuarios." />
      ) : viewMode === 'list' ? (
        <div className="flex flex-col gap-2.5">
          {users.map((u) => (
            <div
              key={u.id}
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-surface border border-white/10 rounded-2xl px-4 py-3.5 hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                <span className="w-11 h-11 rounded-full bg-mora/20 border border-mora/30 text-[#A5D6A7] flex items-center justify-center font-heading font-black text-base shrink-0">
                  {u.username.slice(0, 1).toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-heading font-bold text-sand text-base">{u.username}</span>
                    <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-xs font-heading font-semibold text-sand/70 uppercase tracking-wider">
                      {u.role}
                    </span>
                  </div>
                  <p className="text-xs text-sand/40 font-mono mt-0.5">ID: {u.id}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center border-t border-white/5 pt-2 sm:border-t-0 sm:pt-0">
                <Toggle
                  checked={u.enabled}
                  onChange={(v) => setEnabled(u, v)}
                  label={u.enabled ? 'Habilitado' : 'Deshabilitado'}
                />
                <ActionButton
                  title={`Editar acceso de ${u.username}`}
                  aria-label={`Editar acceso de ${u.username}`}
                  onClick={() => {
                    setEditing(u)
                    setEditEnabled(u.enabled)
                  }}
                >
                  <Pencil size={14} /> Editar
                </ActionButton>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-mosaic">
          {users.map((u) => (
            <div
              key={u.id}
              className="admin-tile"
            >
              <span className="h-9 w-9 rounded-full bg-mora/20 text-[#A5D6A7] flex items-center justify-center font-heading font-black text-sm">
                {u.username.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sand">{u.username}</p>
                <p className="text-xs text-sand/40">{u.role}</p>
              </div>
              <Toggle
                checked={u.enabled}
                onChange={(v) => setEnabled(u, v)}
                label={u.enabled ? 'Habilitado' : 'Deshabilitado'}
              />
              <ActionButton title={`Editar acceso de ${u.username}`} aria-label={`Editar acceso de ${u.username}`} onClick={() => { setEditing(u); setEditEnabled(u.enabled) }}>
                <Pencil size={16} />
              </ActionButton>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <Modal title={`Editar acceso de ${editing.username}`} onClose={() => !busy && setEditing(null)}>
          <ErrorBox message={error} />
          <p className="text-sm text-sand/60 mb-4">Rol: {editing.role}</p>
          <Toggle checked={enabled} onChange={setEditEnabled} label="Acceso habilitado" />
          <div className="flex justify-end gap-2 mt-6">
            <ActionButton disabled={busy} onClick={() => setEditing(null)}>Cancelar</ActionButton>
            <ActionButton variant="primary" disabled={busy} onClick={async () => {
              setBusy(true)
              setError('')
              try { await userApi.setEnabled(editing.id, enabled); setEditing(null); await load() }
              catch (err) { setError(err instanceof Error ? err.message : 'Error al actualizar') }
              finally { setBusy(false) }
            }}>{busy ? 'Guardando…' : 'Guardar'}</ActionButton>
          </div>
        </Modal>
      )}
      {modalOpen && (
        <Modal title="Nuevo administrador" onClose={() => setModalOpen(false)}>
          <div className="space-y-4">
            <Field label="Usuario">
              <TextInput
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="nuevo.admin"
                autoFocus
              />
            </Field>
            <Field label="Contraseña (mínimo 6 caracteres)">
              <TextInput
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
              />
            </Field>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <ActionButton onClick={() => setModalOpen(false)}>Cancelar</ActionButton>
            <ActionButton
              variant="primary"
              onClick={create}
              disabled={busy || username.trim().length === 0 || password.length < 6}
            >
              {busy ? 'Creando…' : 'Crear usuario'}
            </ActionButton>
          </div>
        </Modal>
      )}
    </section>
  )
}
