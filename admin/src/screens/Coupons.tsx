import { useEffect, useRef, useState, type FormEvent } from 'react'
import { couponApi } from '../api/resources'
import type { Coupon } from '../api/types'
import { ErrorBox, Field, Spinner, SuccessBox, TextInput } from '../components/ui'

const normalizeName = (name: string) => name.trim().toUpperCase()
const buttonClass = 'min-h-11 px-4 py-2 rounded-xl bg-mora text-white disabled:opacity-50 font-heading font-bold text-sm'

export default function CouponsScreen() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [name, setName] = useState('')
  const [percentage, setPercentage] = useState('')
  const [active, setActive] = useState(true)
  const [busy, setBusy] = useState(false)
  const lock = useRef(false)
  const nameInput = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let cancelled = false
    couponApi.list().then(data => { if (!cancelled) setCoupons(data) })
      .catch(err => { if (!cancelled) setError(err instanceof Error ? err.message : 'No se pudieron cargar los cupones.') })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [])

  const reset = () => { setEditing(null); setName(''); setPercentage(''); setActive(true) }
  const save = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (lock.current) return
    setError(''); setSuccess('')
    const normalized = normalizeName(name)
    const value = Number(percentage)
    if (!/^[A-Z0-9][A-Z0-9_-]{1,39}$/.test(normalized)) {
      setError('El nombre debe tener entre 2 y 40 caracteres: letras sin tildes, números, guion o guion bajo.')
      nameInput.current?.focus()
      return
    }
    if (!Number.isInteger(value) || value < 1 || value > 100) {
      setError('Ingresa un porcentaje entero entre 1 y 100.')
      document.getElementById('coupon-percentage')?.focus()
      return
    }
    if (coupons.some(coupon => coupon.id !== editing?.id && normalizeName(coupon.name) === normalized)) {
      setError('Ya existe un cupón con ese nombre. Puedes editarlo o reactivarlo.')
      nameInput.current?.focus()
      return
    }
    lock.current = true; setBusy(true)
    try {
      const input = { name: normalized, percentage: value, active }
      const saved = editing ? await couponApi.update(editing.id, input) : await couponApi.create(input)
      setCoupons(previous => editing ? previous.map(coupon => coupon.id === saved.id ? saved : coupon) : [...previous, saved])
      reset()
      setSuccess(`Cupón ${saved.name} ${editing ? 'actualizado' : 'creado'} con ${saved.percentage} % de descuento.`)
      nameInput.current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar el cupón.')
    } finally { lock.current = false; setBusy(false) }
  }

  return <section aria-labelledby="coupons-title">
    <h1 id="coupons-title" className="font-heading font-black text-sand text-2xl">Cupones</h1>
    <p className="text-sand/70 text-sm mt-2 mb-6">Crea códigos de descuento y administra su porcentaje.</p>
    <ErrorBox message={error} />
    <SuccessBox message={success} />
    {loading ? <Spinner label="Cargando cupones…" /> : <>
      <form onSubmit={save} className="rounded-2xl border border-white/10 bg-surface p-5 mt-4">
        <h2 className="text-sand font-heading font-bold text-lg mb-4">{editing ? `Editar ${editing.name}` : 'Nuevo cupón'}</h2>
        <fieldset disabled={busy} className="grid sm:grid-cols-2 gap-4">
          <Field label="Nombre / código">
            <input ref={nameInput} id="coupon-name" required maxLength={40} value={name} onChange={event => setName(event.target.value)} autoCapitalize="characters" autoComplete="off" spellCheck={false} aria-describedby="coupon-name-help" className="w-full min-h-11 px-3 rounded-xl bg-white/10 border border-white/10 text-sand" />
          </Field>
          <Field label="Porcentaje de descuento">
            <TextInput id="coupon-percentage" required type="number" min={1} max={100} step={1} value={percentage} onChange={event => setPercentage(event.target.value)} />
          </Field>
          <p id="coupon-name-help" className="text-sand/70 text-sm sm:col-span-2">El nombre será el código que ingresará el cliente. Por ejemplo: MORA10. Se guarda en mayúsculas y sin espacios.</p>
          <label className="flex items-center gap-3 text-sand min-h-11"><input type="checkbox" checked={active} onChange={event => setActive(event.target.checked)} className="w-5 h-5" /> Cupón activo</label>
          <div className="flex flex-wrap gap-3 sm:justify-end">
            {editing && <button type="button" onClick={() => { reset(); setError(''); setSuccess(''); nameInput.current?.focus() }} className="min-h-11 px-4 rounded-xl border border-white/20 text-sand">Cancelar edición</button>}
            <button type="submit" className={buttonClass}>{busy ? 'Guardando…' : editing ? 'Guardar cambios' : 'Crear cupón'}</button>
          </div>
        </fieldset>
      </form>
      <h2 className="text-sand font-heading font-bold text-lg mt-8 mb-4">Cupones creados</h2>
      {!coupons.length && <p className="text-sand/70">Todavía no hay cupones.</p>}
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {coupons.slice().sort((a, b) => a.name.localeCompare(b.name)).map(coupon => <article key={coupon.id} className="min-w-0 rounded-2xl border border-white/10 bg-surface p-5">
          <h3 className="text-sand font-bold break-all">{coupon.name}</h3>
          <p className="text-sand text-2xl font-heading mt-2">{coupon.percentage} %</p>
          <p className="text-sand/70 text-sm my-3">{coupon.active ? 'Activo' : 'Inactivo'}</p>
          <button type="button" disabled={busy} className={buttonClass} onClick={() => { setEditing(coupon); setName(coupon.name); setPercentage(String(coupon.percentage)); setActive(coupon.active); setError(''); setSuccess(''); nameInput.current?.focus(); nameInput.current?.scrollIntoView({ block: 'center' }) }}>Editar {coupon.name}</button>
        </article>)}
      </div>
    </>}
  </section>
}
