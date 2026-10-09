import { useEffect, useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
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

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Cargando usuarios…" />
      ) : users.length === 0 ? (
        <EmptyState message="Sin usuarios." />
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
