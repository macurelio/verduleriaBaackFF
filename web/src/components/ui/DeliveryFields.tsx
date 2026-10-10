import type { DeliveryForm } from '../../utils/checkout'

export default function DeliveryFields({ form, onChange, errors, submitted, comunas, windows, payments, today }: {
  form: DeliveryForm; onChange: (field: keyof DeliveryForm, value: string) => void
  errors: Partial<Record<keyof DeliveryForm, string>>; submitted: boolean
  comunas: string[]; windows: string[]; payments: string[]; today: string
}) {
  const inputClass = 'w-full min-h-11 rounded-xl border bg-surface px-3 py-2.5 text-base text-ink placeholder:text-muted focus:border-mora'
  const fieldProps = (field: keyof DeliveryForm) => ({
    id: `delivery-${field}`, value: form[field],
    'aria-invalid': submitted && Boolean(errors[field]),
    'aria-describedby': submitted && errors[field] ? `error-${field}` : undefined,
    className: `${inputClass} ${submitted && errors[field] ? 'border-error' : 'border-border'}`,
    onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => onChange(field, event.target.value),
  })
  const error = (field: keyof DeliveryForm) => submitted && errors[field] ? <p id={`error-${field}`} className="mt-1 text-sm text-error">{errors[field]}</p> : null
  return (
    <fieldset className="space-y-4">
      <legend className="font-heading font-bold text-lg mb-3">Datos de despacho</legend>
      <p className="text-sm text-muted">La tienda confirmará disponibilidad y entrega. Los campos con * son obligatorios.</p>
      <div><label className="field-label" htmlFor="delivery-name">Nombre completo *</label><input {...fieldProps('name')} autoComplete="name" placeholder="Tu nombre" required />{error('name')}</div>
      <div><label className="field-label" htmlFor="delivery-phone">Teléfono *</label><input {...fieldProps('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="+56 9 1234 5678" required />{error('phone')}</div>
      <div><label className="field-label" htmlFor="delivery-address">Dirección y número *</label><input {...fieldProps('address')} autoComplete="street-address" placeholder="Calle, número, depto. o casa" required />{error('address')}</div>
      <div><label className="field-label" htmlFor="delivery-comuna">Comuna *</label><select {...fieldProps('comuna')} required><option value="">Selecciona tu comuna</option>{comunas.map(value => <option key={value}>{value}</option>)}</select>{error('comuna')}</div>
      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 gap-3">
        <div><label className="field-label" htmlFor="delivery-date">Fecha solicitada</label><input {...fieldProps('date')} type="date" min={today} />{error('date')}</div>
        <div><label className="field-label" htmlFor="delivery-window">Horario solicitado</label><select {...fieldProps('window')}><option value="">Horario predeterminado</option>{windows.map(value => <option key={value}>{value}</option>)}</select>{error('window')}</div>
      </div>
      <div><label className="field-label" htmlFor="delivery-payment">Forma de pago</label><select {...fieldProps('payment')}><option value="">Pago predeterminado</option>{payments.map(value => <option key={value}>{value}</option>)}</select>{error('payment')}</div>
      <p className="text-xs text-muted">Si no eliges fecha, horario o pago se usarán el día actual en Chile, {windows[0] || 'el horario configurado'} y {payments[0] || 'el pago configurado'}. La tienda confirmará estas opciones.</p>
      <div><label className="field-label" htmlFor="delivery-notes">Nota para la tienda (opcional)</label><textarea {...fieldProps('notes')} rows={2} className={`${inputClass} border-border resize-y`} maxLength={1000} placeholder="Referencias de la dirección o consultas sobre entrega" /></div>
    </fieldset>
  )
}
