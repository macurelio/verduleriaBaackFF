import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { categoryApi } from '../api/resources'
import type { Category, CategoryInput } from '../api/types'
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

const emptyForm = (): CategoryInput => ({
  name: '',
  emoji: '🥦',
  blurb: '',
  sortOrder: 0,
  active: true,
})

export default function CategoriesScreen() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Category | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<CategoryInput>(emptyForm())
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setCategories(await categoryApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar categorías')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      if (editing) await categoryApi.update(editing.id, form)
      else await categoryApi.create(form)
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (c: Category) => {
    if (!window.confirm(`¿Eliminar "${c.name}"?`)) return
    setError('')
    try {
      await categoryApi.remove(c.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Categorías</h1>
          <p className="text-sand/50 text-sm">Secciones del catálogo en la tienda.</p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() => {
            setEditing(null)
            setForm(emptyForm())
            setModalOpen(true)
          }}
        >
          <Plus size={14} /> Nueva
        </ActionButton>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Cargando categorías…" />
      ) : categories.length === 0 ? (
        <EmptyState message="Sin categorías." />
      ) : (
        <div className="space-y-2">
          {categories
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((c) => (
              <div
                key={c.id}
                className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
              >
                <span className="text-2xl">{c.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sand">
                    {c.name}{' '}
                    <span className="text-sand/40 text-xs font-normal">orden {c.sortOrder}</span>
                  </p>
                  <p className="text-sm text-sand/50 truncate">{c.blurb}</p>
                </div>
                <Toggle
                  checked={c.active}
                  onChange={async (v) => {
                    setError('')
                    try {
                      await categoryApi.update(c.id, { ...c, active: v })
                      await load()
                    } catch (err) {
                      setError(err instanceof Error ? err.message : 'Error')
                    }
                  }}
                  label={c.active ? 'Activa' : 'Inactiva'}
                />
                <ActionButton
                  onClick={() => {
                    setEditing(c)
                    setForm({
                      name: c.name,
                      emoji: c.emoji,
                      blurb: c.blurb,
                      sortOrder: c.sortOrder,
                      active: c.active,
                    })
                    setModalOpen(true)
                  }}
                  title="Editar"
                >
                  <Pencil size={14} />
                </ActionButton>
                <ActionButton onClick={() => remove(c)} variant="danger" title="Eliminar">
                  <Trash2 size={14} />
                </ActionButton>
              </div>
            ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? `Editar ${editing.name}` : 'Nueva categoría'}
          onClose={() => setModalOpen(false)}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre">
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Verduras"
              />
            </Field>
            <Field label="Emoji">
              <TextInput
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="w-24"
              />
            </Field>
            <Field label="Descripción corta" className="sm:col-span-2">
              <TextInput
                value={form.blurb}
                onChange={(e) => setForm({ ...form, blurb: e.target.value })}
                placeholder="Lechugas, acelgas y más"
              />
            </Field>
            <Field label="Orden (sortOrder)">
              <TextInput
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Field>
            <div className="flex items-end pb-2">
              <Toggle
                checked={form.active}
                onChange={(v) => setForm({ ...form, active: v })}
                label="Activa"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <ActionButton onClick={() => setModalOpen(false)}>Cancelar</ActionButton>
            <ActionButton variant="primary" onClick={save} disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar'}
            </ActionButton>
          </div>
        </Modal>
      )}
    </section>
  )
}