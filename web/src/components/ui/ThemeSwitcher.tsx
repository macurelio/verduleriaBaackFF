import { Sun, Moon, Sprout } from 'lucide-react'
import { useTheme, type ThemeKey } from '../../context/ThemeContext'

export default function ThemeSwitcher({ className = '' }: { className?: string }) {
  const { themeKey, setThemeKey, themes } = useTheme()

  const getIcon = () => {
    switch (themeKey) {
      case 'vercelDark':
        return <Moon size={13} className="text-emerald-400" />
      case 'farmSage':
        return <Sprout size={13} className="text-emerald-400" />
      default:
        return <Sun size={13} className="text-amber-500" />
    }
  }

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <span className="p-1 rounded-lg bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-300">
        {getIcon()}
      </span>
      <select
        value={themeKey}
        onChange={(e) => setThemeKey(e.target.value as ThemeKey)}
        className="text-xs py-1 px-2.5 rounded-xl bg-white dark:bg-zinc-900 text-stone-800 dark:text-zinc-100 border border-stone-200 dark:border-zinc-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 cursor-pointer shadow-sm font-heading font-semibold"
        aria-label="Seleccionar tema visual"
      >
        {Object.entries(themes).map(([key, t]) => (
          <option key={key} value={key} className="bg-white dark:bg-zinc-900 text-stone-900 dark:text-white">
            {t.name}
          </option>
        ))}
      </select>
    </div>
  )
}
