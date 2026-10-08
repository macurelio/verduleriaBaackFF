import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import { orderApi } from '../api/resources'
import type { Order, OrderStatus } from '../api/types'
import { EmptyState, ErrorBox, Select, Spinner, StatusPill, fmtCLP } from '../components/ui'

const STATUSES: OrderStatus[] = ['PENDING', 'CONFIRMED', 'DELIVERED', 'CANCELLED']
const PAGE_SIZE = 15

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' })

export default function OrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('')
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
          <p className="text-sand/50 text-sm">Pedidos por WhatsApp registrados en la tienda.</p>
        </div>
        <div className="flex items-center gap-2">
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
                {s}
              </option>
            ))}
          </Select>
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
        <div className="space-y-3">
          {orders.map((order) => (
            <div key={order.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
              <button
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                className="w-full flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 text-left hover:bg-white/5 transition-colors"
              >
                <span className="font-heading font-bold text-[#A5D6A7] text-sm">{order.code}</span>
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
                    {order.items.map((item) => (
                      <div
                        key={item.productId}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-sand/70">
                          {item.quantity} × {item.productName}
                        </span>
                        <span className="text-sand font-semibold">{fmtCLP(item.lineTotal)}</span>
                      </div>
                    ))}
                    <div className="flex items-center justify-between text-sm pt-2 border-t border-white/10">
                      <span className="text-sand/60">Subtotal · Envío</span>
                      <span className="text-sand/60">
                        {fmtCLP(order.subtotal)} · {order.shipping === 0 ? 'Gratis' : fmtCLP(order.shipping)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-sand/50 uppercase tracking-wide mr-2">Estado:</span>
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
                        {s}
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

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page === 0}
                onClick={() => {
                  const next = page - 1
                  setPage(next)
                  load(statusFilter, next)
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-sand/70 disabled:opacity-40 text-sm"
              >
                ← Anterior
              </button>
              <span className="text-sm text-sand/50">
                Página {page + 1} de {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => {
                  const next = page + 1
                  setPage(next)
                  load(statusFilter, next)
                }}
                className="px-3 py-1.5 rounded-lg border border-white/10 text-sand/70 disabled:opacity-40 text-sm"
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