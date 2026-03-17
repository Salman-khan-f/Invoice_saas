import { useState } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  LayoutDashboard, Users, FileText, LogOut, Menu, X,
  ChevronRight, Zap, Bell
} from 'lucide-react'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/clients',   icon: Users,           label: 'Clients'   },
  { to: '/invoices',  icon: FileText,        label: 'Invoices'  },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-20 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-30 w-64 flex flex-col bg-slate-900 border-r border-slate-800 transition-transform duration-300',
        'lg:static lg:translate-x-0',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div className="w-9 h-9 bg-primary-600 rounded-xl flex items-center justify-center shadow-lg shadow-primary-900/50">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white text-lg leading-none">InvoiceFlow</span>
            <p className="text-xs text-slate-500 mt-0.5">Business Suite</p>
          </div>
          <button className="ml-auto lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Workspace */}
        <div className="px-4 py-3 border-b border-slate-800/50">
          <div className="bg-slate-800/50 rounded-xl px-3 py-2.5 flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.companyName?.[0]?.toUpperCase() || 'C'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.companyName}</p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-xs font-semibold text-slate-600 uppercase tracking-wider">Menu</p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              )}>
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  <span className="flex-1">{label}</span>
                  {isActive && <ChevronRight size={14} className="text-primary-500" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-slate-800">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-950/30 transition-all">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="h-14 flex items-center px-4 lg:px-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-sm flex-shrink-0 gap-3">
          <button className="lg:hidden text-slate-400 hover:text-white"
            onClick={() => setSidebarOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex-1" />
          <button className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors relative">
            <Bell size={17} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-slate-300">{user?.name}</span>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
