import { useEffect, useState } from 'react'
import {
  RefreshCw,
  Pencil,
  ChevronDown,
  Calendar,
  MapPin,
  MessageCircle,
  List,
  LayoutGrid,
} from 'lucide-react'
import { orderApi } from '../api/resources'
import type { Order, OrderStatus } from '../api/types'
import { EmptyState, ErrorBox, Select, Spinner, StatusPill, fmtCLP } from '../components/ui'

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']
const STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING: 'Pendiente',
  CONFIRMED: 'Confirmado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
}
const PAGE_SIZE = 15

const fmtDate = (iso: string) =>
  new Date(iso.length === 10 ? `${iso}T12:00:00` : iso).toLocaleDateString('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const load = async (targetStatus = statusFilter, targetPage = page) => {
    setLoading(true)
    setError('')
    try {
      const res = await orderApi.list(targetStatus || undefined, targetPage, PAGE_SIZE)
      setOrders(res.content)
      setPage(targetPage)
      setTotalPages(res.totalPages)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const changeStatus = async (id: string, status: OrderStatus) => {
    setActionError('')
    try {
      await orderApi.updateStatus(id, status)
      await load()
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Error al actualizar')
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Pedidos</h1>
          <p className="text-sand/50 text-sm">Pedidos registrados en la tienda, con o sin WhatsApp.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select
            value={statusFilter}
            onChange={(e) => {
              const next = e.target.value as '' | OrderStatus
              setStatusFilter(next)
              load(next, 0)
            }}
            className="w-44"
            aria-label="Filtrar por estado"
          >
            <option value="">Todos los estados</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>

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

          <button
            onClick={() => load()}
            className="p-2.5 rounded-xl border border-white/10 text-sand/70 hover:text-sand hover:bg-white/10"
            aria-label="Recargar"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      <ErrorBox message={error || actionError} />

      {loading ? (
        <Spinner label="Cargando pedidos…" />
      ) : orders.length === 0 ? (
        <EmptyState message="No hay pedidos para este filtro." />
      ) : (
        <div className="space-y-4">
          {viewMode === 'list' ? (
            <div className="flex flex-col gap-2.5">
              {/* Encabezado visible en pantallas grandes */}
              <div className="hidden lg:grid grid-cols-12 gap-3 px-5 py-2.5 bg-white/[0.02] border border-white/5 rounded-xl text-xs font-heading font-bold uppercase tracking-wider text-sand/50">
                <div className="col-span-2">Código</div>
                <div className="col-span-3">Cliente / Comuna</div>
                <div className="col-span-2">Entrega</div>
                <div className="col-span-2 text-center">Estado</div>
                <div className="col-span-2 text-right">Total</div>
                <div className="col-span-1 text-right">Detalle</div>
              </div>

              {orders.map((order) => {
                const isExpanded = expanded === order.id
                return (
                  <div
                    key={order.id}
                    className={`bg-surface border rounded-2xl transition-all duration-200 overflow-hidden ${
                      isExpanded
                        ? 'border-mora/70 shadow-lg'
                        : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : order.id)}
                      aria-expanded={isExpanded}
                      aria-label={`Ver y editar estado del pedido ${order.code}`}
                      className="w-full px-4 sm:px-5 py-3.5 text-left transition-colors hover:bg-white/[0.03] focus-visible:outline-none"
                    >
                      {/* Fila en pantallas grandes */}
                      <div className="hidden lg:grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-2">
                          <span className="font-heading font-black text-[#A5D6A7] text-sm tracking-wide">
                            {order.code}
                          </span>
                        </div>
                        <div className="col-span-3 min-w-0">
                          <p className="text-sand text-sm font-semibold truncate">
                            {order.customerName}
                          </p>
                          <p className="text-sand/50 text-xs flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="shrink-0 text-sand/40" />
                            <span className="truncate">{order.comuna}</span>
                          </p>
                        </div>
                        <div className="col-span-2 text-xs text-sand/70">
                          <p className="font-medium text-sand flex items-center gap-1">
                            <Calendar size={12} className="shrink-0 text-sand/40" />
                            {fmtDate(order.deliveryDate)}
                          </p>
                          {order.deliveryWindow && (
                            <p className="text-sand/40 text-[11px] truncate mt-0.5">
                              {order.deliveryWindow}
                            </p>
                          )}
                        </div>
                        <div className="col-span-2 flex justify-center">
                          <StatusPill status={order.status} />
                        </div>
                        <div className="col-span-2 text-right font-heading font-black text-sand text-base">
                          {fmtCLP(order.total)}
                        </div>
                        <div className="col-span-1 flex justify-end">
                          <span
                            className={`p-1.5 rounded-lg bg-white/5 border border-white/10 text-sand/70 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180 bg-mora/20 text-[#A5D6A7]' : ''
                            }`}
                          >
                            <ChevronDown size={16} />
                          </span>
                        </div>
                      </div>

                      {/* Vista para móviles y tablets */}
                      <div className="flex lg:hidden flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <span className="font-heading font-black text-[#A5D6A7] text-sm">
                            {order.code}
                          </span>
                          <div className="flex items-center gap-2">
                            <StatusPill status={order.status} />
                            <span
                              className={`p-1 rounded-lg bg-white/5 text-sand/70 transition-transform duration-200 ${
                                isExpanded ? 'rotate-180 text-[#A5D6A7]' : ''
                              }`}
                            >
                              <ChevronDown size={14} />
                            </span>
                          </div>
                        </div>
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sand text-sm font-semibold truncate">
                              {order.customerName}
                            </p>
                            <p className="text-sand/50 text-xs">
                              {order.comuna} · {fmtDate(order.deliveryDate)}
                            </p>
                          </div>
                          <span className="font-heading font-black text-sand text-base shrink-0">
                            {fmtCLP(order.total)}
                          </span>
                        </div>
                      </div>
                    </button>

                    {/* Detalle expandido */}
                    {isExpanded && (
                      <div className="border-t border-white/10 px-4 sm:px-5 py-4 space-y-4 bg-black/15">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                          <div>
                            <p className="text-sand/40 text-xs uppercase font-heading font-semibold">
                              Teléfono
                            </p>
                            <p className="text-sand font-medium">{order.phone}</p>
                          </div>
                          <div>
                            <p className="text-sand/40 text-xs uppercase font-heading font-semibold">
                              Dirección
                            </p>
                            <p className="text-sand font-medium">{order.address}</p>
                          </div>
                          <div>
                            <p className="text-sand/40 text-xs uppercase font-heading font-semibold">
                              Entrega
                            </p>
                            <p className="text-sand font-medium">
                              {fmtDate(order.deliveryDate)} · {order.deliveryWindow}
                            </p>
                          </div>
                          <div>
                            <p className="text-sand/40 text-xs uppercase font-heading font-semibold">
                              Pago
                            </p>
                            <p className="text-sand font-medium">{order.paymentMethod}</p>
                          </div>
                          <div>
                            <p className="text-sand/40 text-xs uppercase font-heading font-semibold">
                              Creado
                            </p>
                            <p className="text-sand font-medium">{fmtDate(order.createdAt)}</p>
                          </div>
                          {order.notes && (
                            <div>
                              <p className="text-sand/40 text-xs uppercase font-heading font-semibold">
                                Notas
                              </p>
                              <p className="text-sand font-medium">{order.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="bg-surface/60 border border-white/10 rounded-xl p-3.5 space-y-1.5">
                          <p className="text-xs uppercase font-heading font-bold text-sand/50 mb-2">
                            Productos del pedido
                          </p>
                          {order.items.map((item, index) => (
                            <div
                              key={`${item.packId ?? 'single'}-${item.productId}-${index}`}
                              className="flex items-center justify-between text-sm py-0.5"
                            >
                              <span className="text-sand/80">
                                {item.packId &&
                                  `Pack personalizado ${
                                    [
                                      ...new Set(
                                        order.items.map((line) => line.packId).filter(Boolean),
                                      ),
                                    ].indexOf(item.packId) + 1
                                  } · `}
                                {item.quantity} × {item.productName}
                              </span>
                              <span className="text-sand font-semibold font-heading">
                                {fmtCLP(item.lineTotal)}
                              </span>
                            </div>
                          ))}
                          {!!order.packDiscount && (
                            <p className="text-sm text-[#A5D6A7] flex justify-between pt-1 border-t border-white/5">
                              <span>Descuento packs</span>
                              <span>−{fmtCLP(order.packDiscount)}</span>
                            </p>
                          )}
                          {!!order.couponDiscount && (
                            <p className="text-sm text-[#A5D6A7] flex justify-between">
                              <span>Cupón {order.couponCode}</span>
                              <span>−{fmtCLP(order.couponDiscount)}</span>
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                            <span className="text-sand/60">Subtotal · Envío</span>
                            <span className="text-sand/60">
                              {fmtCLP(order.subtotal)} ·{' '}
                              {order.shipping === 0 ? 'Gratis' : fmtCLP(order.shipping)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-base pt-2 border-t border-white/10 font-heading font-black">
                            <span className="text-sand">Total</span>
                            <span className="text-sand text-lg">{fmtCLP(order.total)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          <span className="text-xs text-sand/50 uppercase font-heading font-bold mr-2">
                            Estado:
                          </span>
                          {STATUSES.map((s) => (
                            <button
                              key={s}
                              onClick={() => changeStatus(order.id, s)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold border transition-colors ${
                                order.status === s
                                  ? 'bg-mora border-mora text-white'
                                  : 'border-white/10 text-sand/60 hover:text-sand hover:bg-white/5'
                              }`}
                            >
                              {STATUS_LABELS[s]}
                            </button>
                          ))}
                          <a
                            href={order.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-heading font-bold bg-[#25D366] text-charcoal hover:bg-[#1FBD5C] transition-colors"
                          >
                            <MessageCircle size={14} />
                            Abrir WhatsApp
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="admin-mosaic">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                    aria-expanded={expanded === order.id}
                    aria-label={`Ver y editar estado del pedido ${order.code}`}
                    className="w-full flex flex-col items-start gap-2 px-4 py-4 text-left hover:bg-white/5 transition-colors"
                  >
                    <span className="font-heading font-bold text-[#A5D6A7] text-sm">
                      {order.code}
                    </span>
                    <Pencil size={16} className="self-end text-sand/70" aria-hidden="true" />
                    <span className="text-sand text-sm font-semibold">{order.customerName}</span>
                    <span className="text-sand/50 text-xs">{order.comuna}</span>
                    <span className="text-sand/50 text-xs">{fmtDate(order.deliveryDate)}</span>
                    <span className="ml-auto flex items-center gap-3">
                      <StatusPill status={order.status} />
                      <span className="font-heading font-black text-sand text-sm">
                        {fmtCLP(order.total)}
                      </span>
                    </span>
                  </button>

                  {expanded === order.id && (
                    <div className="border-t border-white/10 px-4 py-4 space-y-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <p className="text-sand/40 text-xs uppercase">Teléfono</p>
                          <p className="text-sand">{order.phone}</p>
                        </div>
                        <div>
                          <p className="text-sand/40 text-xs uppercase">Dirección</p>
                          <p className="text-sand">{order.address}</p>
                        </div>
                        <div>
                          <p className="text-sand/40 text-xs uppercase">Entrega</p>
                          <p className="text-sand">
                            {fmtDate(order.deliveryDate)} · {order.deliveryWindow}
                          </p>
                        </div>
                        <div>
                          <p className="text-sand/40 text-xs uppercase">Pago</p>
                          <p className="text-sand">{order.paymentMethod}</p>
                        </div>
                        <div>
                          <p className="text-sand/40 text-xs uppercase">Creado</p>
                          <p className="text-sand">{fmtDate(order.createdAt)}</p>
                        </div>
                        {order.notes && (
                          <div>
                            <p className="text-sand/40 text-xs uppercase">Notas</p>
                            <p className="text-sand">{order.notes}</p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1">
                        {order.items.map((item, index) => (
                          <div
                            key={`${item.packId ?? 'single'}-${item.productId}-${index}`}
                            className="flex items-center justify-between text-sm"
                          >
                            <span className="text-sand/70">
                              {item.packId &&
                                `Pack personalizado ${
                                  [
                                    ...new Set(
                                      order.items.map((line) => line.packId).filter(Boolean),
                                    ),
                                  ].indexOf(item.packId) + 1
                                } · `}
                              {item.quantity} × {item.productName}
                            </span>
                            <span className="text-sand font-semibold">
                              {fmtCLP(item.lineTotal)}
                            </span>
                          </div>
                        ))}
                        {!!order.packDiscount && (
                          <p className="text-sm text-sand">
                            Descuento packs: −{fmtCLP(order.packDiscount)}
                          </p>
                        )}
                        {!!order.couponDiscount && (
                          <p className="text-sm text-sand">
                            Cupón {order.couponCode}: −{fmtCLP(order.couponDiscount)}
                          </p>
                        )}
                        <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                          <span className="text-sand/60">Subtotal · Envío</span>
                          <span className="text-sand/60">
                            {fmtCLP(order.subtotal)} ·{' '}
                            {order.shipping === 0 ? 'Gratis' : fmtCLP(order.shipping)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs text-sand/50 uppercase tracking-wide mr-2">
                          Estado:
                        </span>
                        {STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => changeStatus(order.id, s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-heading font-bold border transition-colors ${
                              order.status === s
                                ? 'bg-mora border-mora text-white'
                                : 'border-white/10 text-sand/60 hover:text-sand hover:bg-white/5'
                            }`}
                          >
                            {STATUS_LABELS[s]}
                          </button>
                        ))}
                        <a
                          href={order.whatsappUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-auto px-3 py-1.5 rounded-lg text-xs font-heading font-bold bg-[#25D366] text-charcoal hover:bg-[#1FBD5C]"
                        >
                          Abrir WhatsApp
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                disabled={page === 0}
                onClick={() => {
                  const next = page - 1
                  setPage(next)
                  load(statusFilter, next)
                }}
                className="px-3.5 py-2 rounded-xl border border-white/10 text-sand/70 disabled:opacity-40 text-sm hover:bg-white/5 transition-colors"
              >
                ← Anterior
              </button>
              <span className="text-sm text-sand/50 px-2 font-medium">
                Página {page + 1} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => {
                  const next = page + 1
                  setPage(next)
                  load(statusFilter, next)
                }}
                className="px-3.5 py-2 rounded-xl border border-white/10 text-sand/70 disabled:opacity-40 text-sm hover:bg-white/5 transition-colors"
              >
                Siguiente →
              </button>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
