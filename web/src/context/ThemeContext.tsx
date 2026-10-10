import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeKey = 'freshLight' | 'vercelDark' | 'farmSage'

export interface ThemeConfig {
  key: ThemeKey
  name: string
  bg: string
  cardBg: string
  textMain: string
  textMuted: string
  border: string
  accent: string
  accentColor: string
  headerBg: string
  tagBg: string
}

export const THEMES: Record<ThemeKey, ThemeConfig> = {
  freshLight: {
    key: 'freshLight',
    name: 'Fresh Light (Orgánico)',
    bg: 'bg-stone-50',
    cardBg: 'bg-white',
    textMain: 'text-stone-900',
    textMuted: 'text-stone-500',
    border: 'border-stone-200',
    accent: 'emerald',
    accentColor: '#10b981',
    headerBg: 'bg-white/90 backdrop-blur-md border-stone-200',
    tagBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  vercelDark: {
    key: 'vercelDark',
    name: 'Vercel Dark (High-Tech)',
    bg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900',
    textMain: 'text-zinc-100',
    textMuted: 'text-zinc-400',
    border: 'border-zinc-800',
    accent: 'emerald',
    accentColor: '#34d399',
    headerBg: 'bg-zinc-950/90 backdrop-blur-md border-zinc-800',
    tagBg: 'bg-zinc-800 text-emerald-400 border-zinc-700',
  },
  farmSage: {
    key: 'farmSage',
    name: 'Farm Sage (Mercado Rústico)',
    bg: 'bg-[#0f2419]',
    cardBg: 'bg-[#153424]',
    textMain: 'text-emerald-50',
    textMuted: 'text-emerald-200/70',
    border: 'border-emerald-900/60',
    accent: 'emerald',
    accentColor: '#4ade80',
    headerBg: 'bg-[#0f2419]/90 backdrop-blur-md border-emerald-900/50',
    tagBg: 'bg-emerald-900/50 text-emerald-300 border-emerald-800',
  },
}

interface ThemeContextType {
  themeKey: ThemeKey
  theme: ThemeConfig
  setThemeKey: (key: ThemeKey) => void
  themes: Record<ThemeKey, ThemeConfig>
}

const ThemeContext = createContext<ThemeContextType | null>(null)
const THEME_STORAGE_KEY = 'mv_selected_theme'

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeKey, setThemeKeyState] = useState<ThemeKey>(() => {
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeKey
      if (saved && THEMES[saved]) return saved
    } catch {
      /* ignore */
    }
    return 'freshLight'
  })

  const setThemeKey = (key: ThemeKey) => {
    setThemeKeyState(key)
    try {
      localStorage.setItem(THEME_STORAGE_KEY, key)
    } catch {
      /* ignore */
    }
  }

  const theme = THEMES[themeKey]

  useEffect(() => {
    const root = document.documentElement
    root.classList.remove('theme-freshLight', 'theme-vercelDark', 'theme-farmSage', 'dark')
    root.classList.add(`theme-${themeKey}`)
    if (themeKey !== 'freshLight') {
      root.classList.add('dark')
    }
  }, [themeKey])

  return (
    <ThemeContext.Provider value={{ themeKey, theme, setThemeKey, themes: THEMES }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
