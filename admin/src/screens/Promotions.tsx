import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { promotionApi } from '../api/resources'
import type { Promotion, PromotionInput } from '../api/types'
import {
  ActionButton,
  EmptyState,
  ErrorBox,
  Field,
  Modal,
  Spinner,
  TextArea,
  TextInput,
  Toggle,
  fmtCLP,
} from '../components/ui'

const emptyForm = (): PromotionInput => ({
  id: '',
  label: '',
  title: '',
  subtitle: null,
  description: '',
  originalPrice: 0,
  promoPrice: 0,
  badge: '',
  emoji: '🛒',
  gradientFrom: '#2F7A3F',
  gradientTo: '#1E5631',
  tag: '',
  items: [],
  targetCategory: null,
  primaryLabel: 'Pedir por WhatsApp',
  validFrom: null,
  validTo: null,
  sortOrder: 0,
  active: true,
})

export default function PromotionsScreen() {
  const [promos, setPromos] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Promotion | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [itemsText, setItemsText] = useState('')
  const [form, setForm] = useState<PromotionInput>(emptyForm())
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setPromos(await promotionApi.list())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar promociones')
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
      const items = itemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const payload: PromotionInput = {
        ...form,
        items,
        tag: form.tag.trim() || 'OFERTA',
        emoji: form.emoji.trim() || '🛒',
      }
      if (editing) await promotionApi.update(editing.id, payload)
      else await promotionApi.create(payload)
      setModalOpen(false)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  const toggleActive = async (p: Promotion, value: boolean) => {
    setError('')
    try {
      await promotionApi.setActive(p.id, value)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const remove = async (p: Promotion) => {
    if (!window.confirm(`¿Eliminar "${p.title}"?`)) return
    setError('')
    try {
      await promotionApi.remove(p.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm())
    setItemsText('')
    setModalOpen(true)
  }

  const openEdit = (p: Promotion) => {
    setEditing(p)
    setForm({ ...p })
    setItemsText(p.items.join('\n'))
    setModalOpen(true)
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Promociones</h1>
          <p className="text-sand/50 text-sm">Combinados y combos de temporada.</p>
        </div>
        <ActionButton variant="primary" onClick={openCreate}>
          <Plus size={14} /> Nueva
        </ActionButton>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Cargando promociones…" />
      ) : promos.length === 0 ? (
        <EmptyState message="Sin promociones. Crea una con «Nueva»." />
      ) : (
        <div className="space-y-3">
          {promos
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center gap-4 bg-white/5 border border-white/10 rounded-2xl px-4 py-3"
              >
                <span
                  className="h-11 w-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
                  style={{ background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})` }}
                >
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sand truncate">
                    {p.title}{' '}
                    <span className="text-sand/40 text-xs font-normal">{p.tag}</span>
                  </p>
                  <p className="text-sm text-sand/50">
                    <span className="line-through">{fmtCLP(p.originalPrice)}</span>{' '}
                    <span className="font-bold text-[#A5D6A7]">{fmtCLP(p.promoPrice)}</span>
                  </p>
                </div>
                <span className="text-sand/40 text-xs">Orden {p.sortOrder}</span>
                <div className="flex items-center gap-3">
                  <Toggle
                    checked={p.active}
                    onChange={(v) => toggleActive(p, v)}
                    label={p.active ? 'Activa' : 'Inactiva'}
                  />
                  <ActionButton onClick={() => openEdit(p)} title="Editar">
                    <Pencil size={14} />
                  </ActionButton>
                  <ActionButton onClick={() => remove(p)} variant="danger" title="Eliminar">
                    <Trash2 size={14} />
                  </ActionButton>
                </div>
              </div>
            ))}
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? `Editar ${editing.title}` : 'Nueva promoción'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ID (código, ej. combo-verde)">
              <TextInput
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editing}
                placeholder="combo-verde"
              />
            </Field>
            <Field label="Label">
              <TextInput
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="Oferta de la semana"
              />
            </Field>
            <Field label="Título">
              <TextInput
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="Combo Verde"
              />
            </Field>
            <Field label="Badge">
              <TextInput
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="-20%"
              />
            </Field>
            <Field label="Descripción">
              <TextArea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </Field>
            <Field label="Precio original (CLP)">
              <TextInput
                type="number"
                min={0}
                value={form.originalPrice || ''}
                onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })}
              />
            </Field>
            <Field label="Precio promoción (CLP)">
              <TextInput
                type="number"
                min={0}
                value={form.promoPrice || ''}
                onChange={(e) => setForm({ ...form, promoPrice: Number(e.target.value) })}
              />
            </Field>
            <Field label="Item por línea (uno por línea)">
              <TextArea
                value={itemsText}
                onChange={(e) => setItemsText(e.target.value)}
                rows={4}
                placeholder={'1 kg Lechuga Economica\n1 kg Tomate Pomarola'}
              />
            </Field>
            <Field label="Emoji">
              <TextInput
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                className="w-24"
              />
            </Field>
            <Field label="Tag">
              <TextInput
                value={form.tag}
                onChange={(e) => setForm({ ...form, tag: e.target.value })}
                placeholder="OFERTA"
              />
            </Field>
            <Field label="Gradiente desde">
              <TextInput
                value={form.gradientFrom}
                onChange={(e) => setForm({ ...form, gradientFrom: e.target.value })}
                placeholder="#2F7A3F"
              />
            </Field>
            <Field label="Gradiente hasta">
              <TextInput
                value={form.gradientTo}
                onChange={(e) => setForm({ ...form, gradientTo: e.target.value })}
                placeholder="#1E5631"
              />
            </Field>
            <Field label="Orden (sortOrder)">
              <TextInput
                type="number"
                value={form.sortOrder}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
              />
            </Field>
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