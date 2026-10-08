import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { productApi, categoryApi } from '../api/resources'
import type { Product, ProductInput, ProductUnit, Category } from '../api/types'
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
  fmtCLP,
} from '../components/ui'

const UNITS: ProductUnit[] = ['kilo', 'unidad', 'atado', 'bolsa', 'docena', 'pack']

const emptyForm = (): ProductInput => ({
  id: '',
  name: '',
  description: '',
  price: 0,
  unit: 'kilo',
  emoji: '🥬',
  badge: '',
  gradientFrom: '#2F7A3F',
  gradientTo: '#1E5631',
  category: '',
  featured: false,
})

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<Product | null>(null)
  const [form, setForm] = useState<ProductInput>(emptyForm())
  const [busy, setBusy] = useState(false)

  const load = async (q = search) => {
    setLoading(true)
    setError('')
    try {
      const [pageRes, catRes] = await Promise.all([
        productApi.list(q || undefined, 0, 100),
        categoryApi.list(),
      ])
      setProducts(pageRes.content)
      setCategories(catRes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar productos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const save = async () => {
    setBusy(true)
    setError('')
    try {
      const payload: ProductInput = {
        ...form,
        badge: form.badge.trim() || null,
        emoji: form.emoji.trim() || '🥬',
      }
      if (editing) await productApi.update(editing.id, payload)
      else await productApi.create(payload)
      setEditing(null)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  const toggleFeatured = async (p: Product, value: boolean) => {
    setError('')
    try {
      await productApi.setFeatured(p.id, value)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const toggleActive = async (p: Product, value: boolean) => {
    setError('')
    try {
      await productApi.setActive(p.id, value)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  const remove = async (p: Product) => {
    if (!window.confirm(`¿Eliminar "${p.name}"?`)) return
    setError('')
    try {
      await productApi.remove(p.id)
      await load()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
    }
  }

  const openCreate = () => {
    setEditing(null)
    setForm({ ...emptyForm(), category: categories[0]?.name ?? '' })
  }

  const openEdit = (p: Product) => {
    setEditing(p)
    setForm({
      id: p.id,
      name: p.name,
      description: p.description,
      price: p.price,
      unit: p.unit,
      emoji: p.emoji,
      badge: p.badge ?? '',
      gradientFrom: p.gradientFrom,
      gradientTo: p.gradientTo,
      category: p.category,
      featured: p.featured,
    })
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Productos</h1>
          <p className="text-sand/50 text-sm">Catálogo visible en la tienda (emoji + gradiente).</p>
        </div>
        <div className="flex items-center gap-2">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Buscar…"
            className="w-48"
          />
          <ActionButton variant="primary" onClick={openCreate}>
            <Plus size={14} /> Nuevo
          </ActionButton>
        </div>
      </div>

      <ErrorBox message={error} />

      {loading ? (
        <Spinner label="Cargando productos…" />
      ) : products.length === 0 ? (
        <EmptyState message="Sin productos. Crea uno con «Nuevo»." />
      ) : (
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-sand/40 border-b border-white/10">
                <th className="px-4 py-3">Producto</th>
                <th className="px-4 py-3">Categoría</th>
                <th className="px-4 py-3">Precio</th>
                <th className="px-4 py-3">Unidad</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-8 w-8 rounded-lg flex items-center justify-center text-lg shrink-0"
                        style={{
                          background: `linear-gradient(135deg, ${p.gradientFrom}, ${p.gradientTo})`,
                        }}
                      >
                        {p.emoji}
                      </span>
                      <div>
                        <p className="font-semibold text-sand">
                          {p.name} {p.featured && <span className="text-[#A5D6A7]">★</span>}
                        </p>
                        <p className="text-sand/40 text-xs">{p.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sand/70">{p.category}</td>
                  <td className="px-4 py-3 font-semibold">{fmtCLP(p.price)}</td>
                  <td className="px-4 py-3 text-sand/70">{p.unit}</td>
                  <td className="px-4 py-3">
                    <Toggle
                      checked={p.active !== false}
                      onChange={(v) => toggleActive(p, v)}
                      label={p.active === false ? 'Inactivo' : 'Activo'}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <ActionButton
                        title={p.featured ? 'Quitar destacado' : 'Marcar destacado'}
                        onClick={() => toggleFeatured(p, !p.featured)}
                        variant={p.featured ? 'success' : 'ghost'}
                      >
                        ★
                      </ActionButton>
                      <ActionButton onClick={() => openEdit(p)} title="Editar">
                        <Pencil size={14} />
                      </ActionButton>
                      <ActionButton onClick={() => remove(p)} variant="danger" title="Eliminar">
                        <Trash2 size={14} />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {(editing || (!editing && products.length === 0 && !loading)) && form.name !== '' && (
        <Modal
          title={editing ? `Editar ${editing.name}` : 'Nuevo producto'}
          onClose={() => setEditing(null)}
          wide
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="ID (código corto, ej. h1)">
              <TextInput
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                disabled={!!editing}
                placeholder="h1"
              />
            </Field>
            <Field label="Nombre">
              <TextInput
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Lechuga Cultivar"
              />
            </Field>
            <Field label="Emoji" className="sm:col-span-2">
              <TextInput
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                placeholder="🥬"
                className="w-24"
              />
            </Field>
            <Field label="Categoría">
              <Select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                <option value="">Selecciona…</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Descripción">
              <TextArea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
              />
            </Field>
            <Field label="Precio (CLP)">
              <TextInput
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
              />
            </Field>
            <Field label="Unidad">
              <Select
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value as ProductUnit })}
              >
                {UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Badge (opcional)">
              <TextInput
                value={form.badge}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Más Popular"
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
            <div className="sm:col-span-2">
              <Toggle
                checked={form.featured}
                onChange={(v) => setForm({ ...form, featured: v })}
                label="Mostrar en destacados de la tienda"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <ActionButton onClick={() => setEditing(null)}>Cancelar</ActionButton>
            <ActionButton variant="primary" onClick={save} disabled={busy}>
              {busy ? 'Guardando…' : 'Guardar'}
            </ActionButton>
          </div>
        </Modal>
      )}
    </section>
  )
}