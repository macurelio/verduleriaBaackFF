import { useState, useRef, useEffect, FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, RotateCcw, ExternalLink } from 'lucide-react'
import { askAssistant, AssistantResponse } from '../../api/assistant'
import { ApiError } from '../../api/client'

interface ChatMessage {
  id: string
  sender: 'user' | 'assistant'
  text: string
  type?: string
  data?: AssistantResponse['data']
  quickReplies?: string[]
}

const INITIAL_QUICK_REPLIES = [
  'Costo de envío',
  'Comunas de reparto',
  'Formas de pago',
  'Estado de mi pedido',
  '¿Tienen promociones?',
]

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'welcome-1',
    sender: 'assistant',
    text: '¡Hola! 👋 Soy el asistente virtual de Mora Verduras. ¿En qué te puedo ayudar hoy?',
    quickReplies: INITIAL_QUICK_REPLIES,
  },
]

export default function ChatAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = (smooth = true) => {
    messagesEndRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(false)
      setHasUnread(false)
      const timer = setTimeout(() => inputRef.current?.focus(), 250)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  useEffect(() => {
    if (isOpen) {
      scrollToBottom(true)
    }
  }, [messages, isLoading])

  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim()
    if (!trimmed || isLoading) return

    const userMsgId = 'u-' + Date.now()
    const userMessage: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: trimmed,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await askAssistant(trimmed)
      const botMsg: ChatMessage = {
        id: 'b-' + Date.now(),
        sender: 'assistant',
        text: response.reply,
        type: response.type,
        data: response.data,
        quickReplies: response.quickReplies && response.quickReplies.length > 0 ? response.quickReplies : undefined,
      }
      setMessages((prev) => [...prev, botMsg])
      if (!isOpen) setHasUnread(true)
    } catch (err: unknown) {
      let errorText = 'Hubo un error al procesar tu consulta. Intenta nuevamente.'
      if (err instanceof ApiError && err.status === 429) {
        errorText = '⏳ Has enviado demasiados mensajes en poco tiempo. Por favor espera un minuto para continuar.'
      } else if (err instanceof Error && err.message) {
        errorText = `${err.message}. Puedes escribirnos directamente por WhatsApp.`
      }

      const errorMsg: ChatMessage = {
        id: 'err-' + Date.now(),
        sender: 'assistant',
        text: errorText,
        quickReplies: ['Costo de envío', 'Comunas de reparto'],
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSendMessage(input)
  }

  const handleQuickReply = (reply: string) => {
    handleSendMessage(reply)
  }

  const handleReset = () => {
    setMessages(INITIAL_MESSAGES)
    setInput('')
    setIsLoading(false)
  }

  return (
    <>
      {/* Botón Flotante */}
      <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-40">
        <motion.button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="relative flex items-center gap-2.5 px-4 py-3 bg-mora hover:bg-mora-dark text-white rounded-full shadow-xl transition-all duration-200 active:scale-95 group focus:outline-none focus:ring-2 focus:ring-mora-light focus:ring-offset-2"
          aria-label={isOpen ? 'Cerrar asistente de ayuda' : 'Abrir asistente de ayuda'}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
        >
          {isOpen ? (
            <X size={22} className="shrink-0 transition-transform duration-200 rotate-0 group-hover:rotate-90" />
          ) : (
            <MessageCircle size={22} className="shrink-0" />
          )}
          <span className="font-heading font-medium text-sm hidden sm:inline">
            {isOpen ? 'Cerrar' : '¿Ayuda?'}
          </span>

          {/* Indicador de activo / no leídos */}
          {!isOpen && (
            <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-mora-light opacity-75" />
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${hasUnread ? 'bg-error' : 'bg-mora-light'}`} />
            </span>
          )}
        </motion.button>
      </div>

      {/* Ventana de Chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Asistente virtual de Mora Verduras"
            className="fixed bottom-28 md:bottom-20 right-4 md:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-h-[540px] h-[500px] bg-surface rounded-2xl shadow-2xl border border-border flex flex-col overflow-hidden"
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
          >
            {/* Cabecera */}
            <div className="bg-gradient-to-r from-mora to-mora-dark text-white px-4 py-3.5 flex items-center justify-between shrink-0 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center text-lg shadow-inner">
                  🥬
                </div>
                <div>
                  <h3 className="font-heading font-bold text-sm tracking-wide leading-tight">
                    Asistente Mora
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-white/80">
                    <span className="w-2 h-2 rounded-full bg-mora-light animate-pulse inline-block" />
                    <span>En línea · Respuesta rápida</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  title="Reiniciar conversación"
                  aria-label="Reiniciar conversación"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Cerrar ventana de chat"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Lista de Mensajes */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-canvas/60">
              {messages.map((msg, index) => {
                const isUser = msg.sender === 'user'
                const isLastAssistant = !isUser && index === messages.length - 1

                return (
                  <div key={msg.id} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                    <div
                      className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed max-w-[85%] whitespace-pre-line shadow-xs ${
                        isUser
                          ? 'bg-mora text-white rounded-tr-xs'
                          : 'bg-surface border border-border text-ink rounded-tl-xs'
                      }`}
                    >
                      {msg.text}

                      {/* Botón de WhatsApp integrado si el bot deriva a contacto */}
                      {msg.data?.whatsappUrl && (
                        <div className="mt-2.5 pt-2 border-t border-border/60">
                          <a
                            href={msg.data.whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-whatsapp hover:bg-whatsapp/90 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
                          >
                            <span>Abrir WhatsApp</span>
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Quick Replies bajo el último mensaje del bot */}
                    {isLastAssistant && msg.quickReplies && !isLoading && (
                      <div className="mt-2.5 flex flex-wrap gap-1.5 max-w-[95%]">
                        {msg.quickReplies.map((qr) => (
                          <button
                            key={qr}
                            type="button"
                            onClick={() => handleQuickReply(qr)}
                            className="px-2.5 py-1 bg-surface border border-border hover:border-mora hover:bg-mora-light/20 text-mora-dark text-xs font-medium rounded-full transition-all duration-150 active:scale-95 shadow-2xs"
                          >
                            {qr}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}

              {/* Indicador de escribiendo / cargando */}
              {isLoading && (
                <div className="flex items-start">
                  <div className="bg-surface border border-border rounded-2xl rounded-tl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-mora/60 animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-mora/60 animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-mora/60 animate-bounce" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Footer */}
            <div className="border-t border-border bg-surface p-2.5 shrink-0">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="¿En qué te ayudo? (ej. ¿envían a Ñuñoa?)"
                  maxLength={300}
                  disabled={isLoading}
                  className="flex-1 bg-sand/50 border border-border focus:border-mora focus:bg-surface rounded-xl px-3.5 py-2 text-sm text-ink placeholder:text-muted focus:outline-none transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="p-2.5 bg-mora hover:bg-mora-dark text-white rounded-xl transition-colors disabled:opacity-40 disabled:hover:bg-mora shrink-0 active:scale-95 shadow-xs"
                  aria-label="Enviar mensaje"
                >
                  <Send size={16} />
                </button>
              </form>
              <span className="text-[10px] text-muted text-center pt-1 block">
                Respuestas automáticas basadas en la tienda Mora Verduras
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
