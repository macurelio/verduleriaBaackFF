import { useEffect, useState } from 'react'
import { configApi } from '../api/resources'
import type { SiteConfig } from '../api/types'
import { ActionButton, ErrorBox, Field, Spinner, TextArea, TextInput } from '../components/ui'

const textarea = (values: string[]) => values.join('\n')
const fromTextarea = (text: string) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

export default function ConfigScreen() {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState('')
  const [busy, setBusy] = useState(false)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      setConfig(await configApi.get())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar configuración')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const save = async () => {
    if (!config) return
    setBusy(true)
    setError('')
    setSaved('')
    try {
      const payload: SiteConfig = {
        ...config,
        comunas: fromTextarea(config.comunas.join('\n')),
        paymentMethods: fromTextarea(config.paymentMethods.join('\n')),
        deliveryWindows: fromTextarea(config.deliveryWindows.join('\n')),
        whatsappNumber: config.whatsappNumber.replace(/\s/g, ''),
      }
      const res = await configApi.update(payload)
      setConfig(res)
      setSaved('Configuración guardada correctamente.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar')
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <Spinner label="Cargando configuración…" />
  if (!config) return <ErrorBox message={error} />

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-heading font-black text-sand text-2xl">Configuración</h1>
          <p className="text-sand/50 text-sm">Datos generales usados por la tienda y los pedidos.</p>
        </div>
        <ActionButton variant="primary" onClick={save} disabled={busy}>
          {busy ? 'Guardando…' : 'Guardar cambios'}
        </ActionButton>
      </div>

      <ErrorBox message={error} />
      {saved && (
        <div className="mb-4 rounded-xl bg-[#1E5631]/40 border border-mora/40 text-[#A5D6A7] text-sm px-4 py-3">
          {saved}
        </div>
      )}

      <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Marca">
            <TextInput
              value={config.brandName}
              onChange={(e) => setConfig({ ...config, brandName: e.target.value })}
            />
          </Field>
          <Field label="WhatsApp (solo dígitos)">
            <TextInput
              value={config.whatsappNumber}
              onChange={(e) => setConfig({ ...config, whatsappNumber: e.target.value })}
              placeholder="56954099576"
            />
          </Field>
          <Field label="Instagram handle">
            <TextInput
              value={config.instagramHandle}
              onChange={(e) => setConfig({ ...config, instagramHandle: e.target.value })}
            />
          </Field>
          <Field label="Instagram URL">
            <TextInput
              value={config.instagramUrl}
              onChange={(e) => setConfig({ ...config, instagramUrl: e.target.value })}
            />
          </Field>
          <Field label="Zona de reparto">
            <TextInput
              value={config.deliveryZone}
              onChange={(e) => setConfig({ ...config, deliveryZone: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Envío ($)">
              <TextInput
                type="number"
                min={0}
                value={config.shippingFee}
                onChange={(e) => setConfig({ ...config, shippingFee: Number(e.target.value) })}
              />
            </Field>
            <Field label="Envío gratis sobre ($)">
              <TextInput
                type="number"
                min={0}
                value={config.freeShippingOver}
                onChange={(e) => setConfig({ ...config, freeShippingOver: Number(e.target.value) })}
              />
            </Field>
          </div>
        </div>

        <Field label="Comunas (una por línea)">
          <TextArea
            value={textarea(config.comunas)}
            onChange={(e) => setConfig({ ...config, comunas: fromTextarea(e.target.value) })}
            rows={4}
          />
        </Field>

        <Field label="Métodos de pago (uno por línea)">
          <TextArea
            value={textarea(config.paymentMethods)}
            onChange={(e) => setConfig({ ...config, paymentMethods: fromTextarea(e.target.value) })}
            rows={2}
          />
        </Field>

        <Field label="Horarios de entrega (uno por línea)">
          <TextArea
            value={textarea(config.deliveryWindows)}
            onChange={(e) => setConfig({ ...config, deliveryWindows: fromTextarea(e.target.value) })}
            rows={2}
          />
        </Field>
      </div>
    </section>
  )
}