import { useState, type ReactNode } from 'react'
import {
  LayoutDashboard,
  ShoppingBag,
  Tag,
  Grid3x3,
  Settings,
  Users,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../auth'
import OrdersScreen from './Orders'
import ProductsScreen from './Products'
import PromotionsScreen from './Promotions'
import CategoriesScreen from './Categories'
import ConfigScreen from './Config'
import UsersScreen from './Users'

type ViewKey =
  | 'orders'
  | 'products'
  | 'promotions'
  | 'categories'
  | 'config'
  | 'users'

const NAV: { key: ViewKey; label: string; icon: ReactNode }[] = [
  { key: 'orders', label: 'Pedidos', icon: <LayoutDashboard size={16} /> },
  { key: 'products', label: 'Productos', icon: <ShoppingBag size={16} /> },
  { key: 'promotions', label: 'Promociones', icon: <Tag size={16} /> },
  { key: 'categories', label: 'Categorías', icon: <Grid3x3 size={16} /> },
  { key: 'config', label: 'Configuración', icon: <Settings size={16} /> },
  { key: 'users', label: 'Usuarios', icon: <Users size={16} /> },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [view, setView] = useState<ViewKey>('orders')

  const render = (): ReactNode => {
    switch (view) {
      case 'orders':
        return <OrdersScreen />
      case 'products':
        return <ProductsScreen />
      case 'promotions':
        return <PromotionsScreen />
      case 'categories':
        return <CategoriesScreen />
      case 'config':
        return <ConfigScreen />
      case 'users':
        return <UsersScreen />
    }
  }

  return (
    <div className="min-h-screen flex bg-charcoal">
      <aside className="hidden md:flex flex-col w-52 shrink-0 bg-surface border-r border-white/10 p-4 sticky top-0 h-[100dvh] overflow-y-auto">
        <div className="flex items-center gap-2 px-2 py-3 mb-4">
          <span className="h-9 w-9 rounded-lg bg-gradient-to-br from-mora to-charcoal flex items-center justify-center text-xl">
            🥬
          </span>
          <div>
            <p className="font-heading font-black text-white text-sm leading-none">Mora</p>
            <p className="font-heading font-black text-sand text-sm leading-none">Verduras</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setView(key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-heading font-bold transition-colors ${
                view === key
                  ? 'bg-mora/20 text-[#A5D6A7]'
                  : 'text-sand/60 hover:text-sand hover:bg-white/5'
              }`}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>

        <div className="border-t border-white/10 pt-3 mt-3 space-y-2">
          <a href={import.meta.env.BASE_URL.replace(/admin\/$/, '')} target="_blank" rel="noopener noreferrer" className="block px-3 py-2 text-sm text-sand hover:underline">Ver tienda ↗</a>
          <p className="px-3 text-xs text-sand/40 truncate">@{user?.username}</p>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-heading font-bold text-sand/60 hover:text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut size={16} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <header className="md:hidden sticky top-0 z-40 bg-surface border-b border-white/10 px-4 py-3 flex items-center justify-between">
          <span className="font-heading font-black text-sand">Mora Verduras · Admin</span>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-sand/60 hover:text-sand hover:bg-white/10"
            aria-label="Cerrar sesión"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="w-full p-3 sm:p-4 lg:p-5 max-w-[1440px] mx-auto">
          <div className="md:hidden flex gap-2 overflow-x-auto scrollbar-hide pb-4 -mx-4 px-4" aria-label="Secciones del panel">
            {NAV.map(({ key, label, icon }) => (
              <button
                key={key}
                onClick={() => setView(key)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-heading font-bold whitespace-nowrap transition-colors ${
                  view === key
                    ? 'bg-mora/20 text-[#A5D6A7]'
                    : 'bg-white/5 text-sand/60 hover:text-sand'
                }`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>
          {render()}
        </main>
      </div>
    </div>
  )
}
