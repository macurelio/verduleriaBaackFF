import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

const STORAGE_KEY = 'mv_selected_comuna'
const DISMISSED_SESSION_KEY = 'mv_comuna_modal_dismissed'

interface LocationContextType {
  selectedComuna: string | null
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  saveComuna: (comuna: string) => void
  clearComuna: () => void
  dismissModal: () => void
}

const LocationContext = createContext<LocationContextType | null>(null)

export function LocationProvider({ children }: { children: ReactNode }) {
  const [selectedComuna, setSelectedComuna] = useState<string | null>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  })

  const [isModalOpen, setIsModalOpen] = useState(false)

  // Abrir automáticamente el modal si el usuario no ha seleccionado comuna en su primera visita
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const dismissed = sessionStorage.getItem(DISMISSED_SESSION_KEY)
      if (!saved && !dismissed) {
        const timer = setTimeout(() => {
          setIsModalOpen(true)
        }, 500)
        return () => clearTimeout(timer)
      }
    } catch {
      // Storage fallback
    }
  }, [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const saveComuna = (comuna: string) => {
    const trimmed = comuna.trim()
    setSelectedComuna(trimmed)
    try {
      localStorage.setItem(STORAGE_KEY, trimmed)
    } catch {
      // Storage may be disabled
    }
    setIsModalOpen(false)
  }

  const clearComuna = () => {
    setSelectedComuna(null)
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage may be disabled
    }
  }

  const dismissModal = () => {
    setIsModalOpen(false)
    try {
      sessionStorage.setItem(DISMISSED_SESSION_KEY, 'true')
    } catch {
      // Storage may be disabled
    }
  }

  return (
    <LocationContext.Provider
      value={{
        selectedComuna,
        isModalOpen,
        openModal,
        closeModal,
        saveComuna,
        clearComuna,
        dismissModal,
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export function useLocation() {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}
