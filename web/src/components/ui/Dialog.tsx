import { useEffect, useRef, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface DialogEntry { layer: HTMLElement; panel: HTMLElement }
const stack: DialogEntry[] = []
const previousInert = new Map<HTMLElement, boolean>()
let previousOverflow = ''
const focusableSelector = 'button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]'

function updateBackground() {
  const top = stack[stack.length - 1]
  for (const child of Array.from(document.body.children)) {
    if (!(child instanceof HTMLElement)) continue
    if (!previousInert.has(child)) previousInert.set(child, child.inert)
    child.inert = top ? child !== top.layer : previousInert.get(child) ?? false
  }
  if (!top) previousInert.clear()
}

/** Un único contrato de teclado, foco y scroll para todos los overlays. */
export default function Dialog({ open, onClose, titleId, children, drawer = false }: {
  open: boolean; onClose: () => void; titleId: string; children: ReactNode; drawer?: boolean
}) {
  const layerRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  useEffect(() => {
    if (!open || !layerRef.current || !panelRef.current) return
    const entry = { layer: layerRef.current, panel: panelRef.current }
    const trigger = document.activeElement instanceof HTMLElement ? document.activeElement : null
    if (stack.length === 0) {
      previousOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    stack.push(entry)
    updateBackground()
    const focusables = () => Array.from(entry.panel.querySelectorAll<HTMLElement>(focusableSelector)).filter(el => el.getClientRects().length > 0)
    const focusFirst = () => (focusables()[0] ?? entry.panel).focus()
    focusFirst()
    const handleKey = (event: KeyboardEvent) => {
      if (stack[stack.length - 1] !== entry) return
      if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeRef.current(); return }
      if (event.key !== 'Tab') return
      const elements = focusables()
      const first = elements[0]
      const last = elements[elements.length - 1]
      if (!first || !last) { event.preventDefault(); entry.panel.focus(); return }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === entry.panel)) {
        event.preventDefault(); last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || document.activeElement === entry.panel)) {
        event.preventDefault(); first.focus()
      }
    }
    const handleFocus = (event: FocusEvent) => {
      if (stack[stack.length - 1] === entry && event.target instanceof Node && !entry.panel.contains(event.target)) focusFirst()
    }
    document.addEventListener('keydown', handleKey, true)
    document.addEventListener('focusin', handleFocus)
    return () => {
      document.removeEventListener('keydown', handleKey, true)
      document.removeEventListener('focusin', handleFocus)
      const wasTop = stack[stack.length - 1] === entry
      stack.splice(stack.indexOf(entry), 1)
      updateBackground()
      if (stack.length === 0) document.body.style.overflow = previousOverflow
      if (wasTop && trigger?.isConnected && !trigger.closest('[inert]')) trigger.focus()
      else if (wasTop) stack[stack.length - 1]?.panel.focus()
    }
  }, [open])

  if (!open) return null
  return createPortal(
    <div ref={layerRef} className={`fixed inset-0 z-[200] bg-charcoal/55 flex ${drawer ? 'justify-end' : 'items-center justify-center p-4'}`} onClick={event => { if (event.target === event.currentTarget) onClose() }}>
      <div ref={panelRef} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1} className={drawer
        ? 'dialog-panel dialog-drawer w-full max-w-lg h-[100dvh] bg-surface text-ink shadow-2xl flex flex-col'
        : 'dialog-panel relative w-full max-w-2xl max-h-[92dvh] overflow-y-auto bg-surface text-ink rounded-3xl shadow-2xl'}>
        {children}
      </div>
    </div>, document.body,
  )
}
