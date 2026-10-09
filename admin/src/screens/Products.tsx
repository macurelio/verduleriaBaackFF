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
  id: `product-${crypto.randomUUID()}`,
  name: '',
  description: '',
  price: 0,
  unit: 'kilo',
  emoji: '🥬',
  badge: '',
  gradientFrom: '#205C2D',
  gradientTo: '#205C2D',
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
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState<ProductInput>(emptyForm())
  const [busy, setBusy] = useState(false)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)

  const load = async (q = search, nextPage = page) => {
    setLoading(true)
    setError('')
    try {
      const [pageRes, catRes] = await Promise.all([
        productApi.list(q || undefined, nextPage, 20),
        categoryApi.list(),
      ])
      setProducts(pageRes.content)
      setCategories(catRes)
      setPage(nextPage)
      setTotalPages(pageRes.totalPages)
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
    if (busy) return
    if (!form.id.trim() || !form.name.trim() || !form.category.trim() || !form.description.trim()) {
      setError('Completa el nombre, categoría y descripción del producto.')
      return
    }
    if (!Number.isSafeInteger(form.price) || form.price <= 0) {
      setError('El precio debe ser un monto entero en CLP mayor a cero.')
      return
    }
    if (![form.gradientFrom, form.gradientTo].every((color) => /^#[\da-f]{6}$/i.test(color))) {
      setError('Los colores deben tener formato hexadecimal, por ejemplo #2F7A3F.')
      return
    }
    setBusy(true)
    setError('')
    try {
      const payload: ProductInput = {
        ...form,
        id: form.id.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        badge: String(form.badge ?? '').trim() || null,
        emoji: form.emoji.trim() || '🥬',
      }
      if (editing) await productApi.update(editing.id, payload)
      else await productApi.create(payload)
      setEditing(null)
      setModalOpen(false)
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
    setModalOpen(true)
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
    setModalOpen(true)
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Productos</h1>
          <p className="text-sand/50 text-sm">Administra precios, categorías y visibilidad del catálogo.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <TextInput
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load(search, 0)}
            aria-label="Buscar productos"
            placeholder="Buscar…"
            className="flex-1 min-w-0 sm:w-48"
          />
          <ActionButton onClick={() => load(search, 0)} disabled={loading}>Buscar</ActionButton>
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
        <div className="admin-mosaic">
          {products.map((p) => (
            <article key={p.id} className="admin-tile h-full">
              <div className="flex items-start justify-between gap-2">
                <span className="w-16 h-16 rounded-xl bg-mora/20 flex items-center justify-center text-4xl" aria-hidden="true">{p.emoji}</span>
                <ActionButton onClick={() => openEdit(p)} title={`Editar ${p.name}`} aria-label={`Editar ${p.name}`}>
                  <Pencil size={18} />
                </ActionButton>
              </div>
              <div className="flex-1">
                <p className="text-xs text-sand/50">{p.category}</p>
                <h2 className="font-heading font-bold text-sand text-lg">{p.name}</h2>
                <p className="text-sm text-sand/50 line-clamp-2">{p.description}</p>
              </div>
              <p className="text-xl font-heading font-black text-mora-light">{fmtCLP(p.price)} <span className="text-xs text-sand/50 font-normal">/ {p.unit}</span></p>
              <Toggle checked={p.active !== false} onChange={(v) => toggleActive(p, v)} label={p.active === false ? 'Inactivo' : 'Activo'} />
              <div className="flex justify-between gap-2 border-t border-white/10 pt-3">
                <ActionButton aria-label={`${p.featured ? 'Quitar destacado de' : 'Destacar'} ${p.name}`} onClick={() => toggleFeatured(p, !p.featured)} variant={p.featured ? 'success' : 'ghost'}>
                  ★ {p.featured ? 'Destacado' : 'Destacar'}
                </ActionButton>
                <ActionButton onClick={() => remove(p)} variant="danger" title={`Eliminar ${p.name}`} aria-label={`Eliminar ${p.name}`}><Trash2 size={14} /></ActionButton>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && !loading && (
        <div className="flex justify-center items-center gap-3 mt-5">
          <ActionButton disabled={page === 0} onClick={() => load(search, page - 1)}>Anterior</ActionButton>
          <span className="text-sm text-sand/60">Página {page + 1} de {totalPages}</span>
          <ActionButton disabled={page >= totalPages - 1} onClick={() => load(search, page + 1)}>Siguiente</ActionButton>
        </div>
      )}

      {modalOpen && (
        <Modal
          title={editing ? `Editar ${editing.name}` : 'Nuevo producto'}
          onClose={() => setModalOpen(false)}
          wide
        >
          <ErrorBox message={error} />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                value={form.badge ?? ''}
                onChange={(e) => setForm({ ...form, badge: e.target.value })}
                placeholder="Más Popular"
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
