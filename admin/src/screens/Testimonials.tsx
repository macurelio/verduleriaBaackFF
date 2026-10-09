import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { testimonialApi } from '../api/resources'
import type { Testimonial, TestimonialInput } from '../api/types'
import {
  ActionButton,
  EmptyState,
  ErrorBox,
  Field,
  Modal,
  Select,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
} from '../components/ui'

const emptyForm = (): TestimonialInput => ({
  name: '',
  handle: '',
  initials: '',
  color: '#2F7A3F',
  text: '',
  rating: 5,
  product: '',
  sortOrder: 0,
  active: true,
})

const RATINGS = [5, 4, 3, 2, 1]

export default function TestimonialsScreen() {
  const [items, setItems] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Testimonial | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<TestimonialInput>(emptyForm())
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setItems(await testimonialApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar testimonios')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (busy) return
    if (!form.name.trim() || !form.text.trim() || !RATINGS.includes(form.rating)) {
      setError('Completa el nombre, el testimonio y una calificación entre 1 y 5.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const initials =
        form.initials ||
        form.name
          .split(' ')
          .map((w) => w[0]?.toUpperCase() ?? '')
          .slice(0, 2)
          .join('')
      const payload = { ...form, initials }
      if (editing) await testimonialApi.update(editing.id, payload)
      else await testimonialApi.create(payload)
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  const remove = async (t: Testimonial) => {
    if (!window.confirm(`¿Eliminar el testimonio de "${t.name}"?`)) return
    setError('')
    try {
      await testimonialApi.remove(t.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < rating ? 'text-amber-400' : 'text-white/20'}>
        ★
      </span>
    ))

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Testimonios</h1>
          <p className="text-sand/50 text-sm">Reseñas de clientes en la tienda.</p>
        </div>
        <ActionButton
          variant="primary"
          onClick={() => {
            setEditing(null)
            setForm(emptyForm())
            setModalOpen(true)
          }}
        >
          <Plus size={14} /> Nuevo
        </ActionButton>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Cargando testimonios…" />
      ) : items.length === 0 ? (
        <EmptyState message="Sin testimonios." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((t) => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span
                  className="h-10 w-10 rounded-full flex items-center justify-center font-heading font-black text-white text-sm"
                  style={{ backgroundColor: t.color }}
                >
                  {t.initials}
                </span>
                <div className="min-w-0">
                  <p className="text-sand font-semibold truncate">{t.name}</p>
                  <p className="text-sand/40 text-xs truncate">@{t.handle}</p>
                </div>
                <div className="ml-auto flex items-center gap-1">
                  <ActionButton
                    onClick={() => {
                      setEditing(t)
                      setForm({
                        name: t.name,
                        handle: t.handle,
                        initials: t.initials,
                        color: t.color,
                        text: t.text,
                        rating: t.rating,
                        product: t.product,
                        sortOrder: t.sortOrder,
                        active: t.active,
                      })
                      setModalOpen(true)
                    }}
                    title="Editar"
                  >
                    <Pencil size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => remove(t)} variant="danger" title="Eliminar">
                    <Trash2 size={14} />
                  </ActionButton>
                </div>
              </div>
              <p className="text-sm text-sand/70 line-clamp-3">{t.text}</p>
              <div className="flex items-center justify-between mt-3 text-xs">
                <span className="text-sand/40">{t.product}</span>
                <span>{renderStars(t.rating)}</span>
              </div>
              {!t.active && (
                <span className="inline-block mt-2 px-2 py-0.5 rounded-full bg-white/10 text-sand/50 text-xs font-bold">
                  Inactivo
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? 'Editar testimonio' : 'Nuevo testimonio'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <ErrorBox message={error} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Nombre">
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="María José"
              />
            </Field>
            <Field label="Handle">
              <TextInput
                value={form.handle}
                onChange={(e) => setForm({ ...form, handle: e.target.value })}
                placeholder="maria.jose"
              />
            </Field>
            <Field label="Iniciales (vacío = automático)">
              <TextInput
                value={form.initials}
                onChange={(e) => setForm({ ...form, initials: e.target.value })}
                placeholder="MJ"
                className="w-24"
              />
            </Field>
            <Field label="Color (hex)">
              <TextInput
                value={form.color}
                onChange={(e) => setForm({ ...form, color: e.target.value })}
                placeholder="#2F7A3F"
                className="w-32"
              />
            </Field>
            <Field label="Producto / Compra">
              <TextInput
                value={form.product}
                onChange={(e) => setForm({ ...form, product: e.target.value })}
                placeholder="Combo Semanal"
              />
            </Field>
            <Field label="Rating">
              <Select
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
              >
                {RATINGS.map((r) => (
                  <option key={r} value={r}>
                    {'★'.repeat(r)}{'☆'.repeat(5 - r)}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Texto" className="sm:col-span-2">
              <TextArea
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                rows={3}
                placeholder="Excelente calidad, llegó todo fresco…"
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
                label="Activo"
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
