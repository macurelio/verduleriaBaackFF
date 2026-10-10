import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import { promotionApi, productApi } from '../api/resources'
import type { Product, Promotion, PromotionInput } from '../api/types'
import { formatPromotionItem, restorePromotionItems, UNIT_LABELS, type SelectedProduct } from '../promotionItems'
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
  // Required by the existing API; equal colors give new promotions a solid background.
  gradientFrom: '#205C2D',
  gradientTo: '#205C2D',
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
  const [products, setProducts] = useState<Product[]>([])
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])
  const [productSearch, setProductSearch] = useState('')
  const [productsLoading, setProductsLoading] = useState(false)
  const [productsError, setProductsError] = useState('')
  const [productsRetry, setProductsRetry] = useState(0)
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

  useEffect(() => {
    if (!modalOpen) return
    let alive = true
    setProductsLoading(true)
    setProductsError('')
    const loadProducts = async () => {
      const all: Product[] = []
      let page = 0
      let totalPages = 1
      do {
        const result = await productApi.list(undefined, page, 100)
        all.push(...result.content)
        totalPages = result.totalPages
        page += 1
      } while (page < totalPages)
      if (!alive) return
      setProducts(all)
      if (editing) {
        const restored = restorePromotionItems(editing.items, all)
        setSelectedProducts(restored.selected)
        setItemsText(restored.unmatched.join('\n'))
      }
    }
    loadProducts().catch((err: unknown) => {
      if (alive) setProductsError(err instanceof Error ? err.message : 'Error al cargar productos')
    }).finally(() => { if (alive) setProductsLoading(false) })
    return () => { alive = false }
  }, [modalOpen, editing, productsRetry])

  const selectedTotal = selectedProducts.reduce((total, item) => {
    const product = products.find((p) => p.id === item.productId)
    return total + (product?.price ?? 0) * item.quantity
  }, 0)
  const normalize = (text: string) => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es-CL')
  const visibleProducts = products.filter((product) =>
    product.unit !== 'pack' && normalize(product.category) !== 'packs' &&
    normalize(`${product.name} ${product.category}`).includes(normalize(productSearch.trim())),
  )

  const selectProduct = (product: Product, checked: boolean) => {
    if (product.unit === 'pack' || normalize(product.category) === 'packs') return
    setSelectedProducts((previous) => checked
      ? [...previous, { productId: product.id, quantity: 1 }]
      : previous.filter((item) => item.productId !== product.id))
  }

  const save = async () => {
    if (busy || productsLoading) return
    if (!form.id.trim() || !form.title.trim() || !form.description.trim()) {
      setError('Completa el código, título y descripción de la promoción.')
      return
    }
    if (![form.originalPrice, form.promoPrice].every((price) => Number.isSafeInteger(price) && price > 0) || form.promoPrice > form.originalPrice) {
      setError('Ingresa precios enteros positivos. El precio promocional no puede superar al original.')
      return
    }
    if (form.validFrom && form.validTo && form.validFrom > form.validTo) {
      setError('La fecha de término debe ser igual o posterior a la fecha de inicio.')
      return
    }
    if (!selectedProducts.length && !itemsText.trim()) {
      setError('Selecciona al menos un producto para la promoción.')
      return
    }
    if (selectedProducts.some(item => products.some(product => product.id === item.productId &&
      (product.unit === 'pack' || normalize(product.category) === 'packs')))) {
      setError('Los packs no pueden incluirse como productos de una promoción. Retira el pack antes de guardar.')
      return
    }
    if (selectedProducts.some((item) => !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 99 || !products.some((p) => p.id === item.productId))) {
      setError('Revisa los productos seleccionados y sus cantidades (entre 1 y 99).')
      return
    }
    setBusy(true)
    setError('')
    try {
      const legacyItems = itemsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean)
      const items = [
        ...selectedProducts.map((item) => formatPromotionItem(products.find((p) => p.id === item.productId)!, item.quantity)),
        ...legacyItems,
      ]
      const payload: PromotionInput = {
        ...form,
        id: form.id.trim(),
        title: form.title.trim(),
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
    setSelectedProducts([])
    setProducts([])
    setProductsLoading(true)
    setProductSearch('')
    setError('')
    setModalOpen(true)
  }

  const openEdit = (p: Promotion) => {
    setEditing(p)
    setForm({ ...p })
    setItemsText(p.items.join('\n'))
    setSelectedProducts([])
    setProducts([])
    setProductsLoading(true)
    setProductSearch('')
    setError('')
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
        <div className="admin-mosaic">
          {promos
            .slice()
            .sort((a, b) => a.sortOrder - b.sortOrder)
            .map((p) => (
              <div
                key={p.id}
                className="admin-tile"
              >
                <span
                  className="h-11 w-11 rounded-xl bg-mora/20 flex items-center justify-center text-2xl shrink-0"
                >
                  {p.emoji}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-sand">
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
                  <ActionButton onClick={() => openEdit(p)} title={`Editar ${p.title}`} aria-label={`Editar ${p.title}`}>
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
          <ErrorBox message={error} />
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
            <div className="sm:col-span-2 rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-heading font-bold text-sand">Productos de la promoción</h3>
                <span className="text-xs text-sand/60" role="status">{selectedProducts.length} seleccionado{selectedProducts.length === 1 ? '' : 's'}</span>
              </div>
              <p className="text-sm text-sand/70">Los packs no se pueden agregar a una promoción.</p>
              {selectedProducts.filter(item => products.some(product => product.id === item.productId && (product.unit === 'pack' || normalize(product.category) === 'packs'))).map(item => <div key={item.productId} className="flex flex-wrap items-center gap-2 text-sm text-sand">
                <span>Pack excluido: {products.find(product => product.id === item.productId)?.name}</span>
                <ActionButton onClick={() => setSelectedProducts(previous => previous.filter(selected => selected.productId !== item.productId))} disabled={busy}>Retirar pack</ActionButton>
              </div>)}
              <TextInput type="search" aria-label="Buscar productos para la promoción" placeholder="Buscar por nombre o categoría…" value={productSearch} onChange={(e) => setProductSearch(e.target.value)} disabled={productsLoading} />
              <ErrorBox message={productsError} />
              {productsError && <ActionButton onClick={() => setProductsRetry((value) => value + 1)}>Reintentar carga de productos</ActionButton>}
              {productsLoading ? <Spinner label="Cargando catálogo…" /> : (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {visibleProducts.map((product) => {
                    const selected = selectedProducts.find((item) => item.productId === product.id)
                    return (
                      <div key={product.id} className="flex flex-wrap items-center gap-3 rounded-lg bg-charcoal/40 p-3">
                        <label className="flex flex-1 items-center gap-3 min-w-[140px] cursor-pointer">
                          <input type="checkbox" checked={!!selected} onChange={(e) => selectProduct(product, e.target.checked)} disabled={busy || (product.active === false && !selected)} className="h-4 w-4 accent-mora" />
                          <span className="min-w-0">
                            <span className="block text-sm font-semibold text-sand">{product.emoji} {product.name}</span>
                            <span className="block text-xs text-sand/60">{fmtCLP(product.price)} / {UNIT_LABELS[product.unit]}{product.active === false ? ' · Inactivo' : ''}</span>
                          </span>
                        </label>
                        {selected && <label className="flex items-center gap-2 text-xs text-sand/70">
                          Cantidad
                          <TextInput type="number" min={1} max={99} step={1} value={selected.quantity || ''} aria-label={`Cantidad de ${product.name}`} disabled={busy} onChange={(e) => setSelectedProducts((previous) => previous.map((item) => item.productId === product.id ? { ...item, quantity: Number(e.target.value) } : item))} className="!w-20" />
                        </label>}
                      </div>
                    )
                  })}
                  {!productsError && visibleProducts.length === 0 && <p className="text-sm text-sand/60 py-3">{products.length ? 'No hay productos que coincidan con tu búsqueda.' : 'Crea productos en el catálogo para agregarlos a una promoción.'}</p>}
                </div>
              )}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3">
                <p className="text-sm text-sand">Total de productos: <strong>{fmtCLP(selectedTotal)}</strong></p>
                <ActionButton disabled={!selectedProducts.length || busy || productsLoading} onClick={() => setForm({ ...form, originalPrice: selectedTotal })}>Usar como precio original</ActionButton>
              </div>
            </div>
            {itemsText && <Field label="Contenido anterior sin producto asociado (una línea por ítem)" className="sm:col-span-2">
              <TextArea value={itemsText} onChange={(e) => setItemsText(e.target.value)} rows={3} />
              <p className="text-xs text-sand/50 mt-2">Estas líneas se conservarán. Puedes quitarlas después de seleccionar sus productos en el catálogo.</p>
            </Field>}
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
            <Field label="Vigente desde (opcional)">
              <TextInput type="date" value={form.validFrom?.slice(0, 10) ?? ''} onChange={(e) => setForm({ ...form, validFrom: e.target.value || null })} />
            </Field>
            <Field label="Vigente hasta (opcional)">
              <TextInput type="date" value={form.validTo?.slice(0, 10) ?? ''} min={form.validFrom?.slice(0, 10)} onChange={(e) => setForm({ ...form, validTo: e.target.value || null })} />
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
            <ActionButton variant="primary" onClick={save} disabled={busy || productsLoading || (!!productsError && !editing)}>
              {busy ? 'Guardando…' : 'Guardar'}
            </ActionButton>
          </div>
        </Modal>
      )}
    </section>
  )
}
