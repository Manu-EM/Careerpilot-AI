import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, FileText, Send,
  KanbanSquare, BarChart3, Settings, LogOut,
  Menu, X, Rocket, ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/jobs',      icon: Briefcase,       label: 'Jobs'      },
  { to: '/resume',    icon: FileText,         label: 'Resume'    },
  { to: '/apply',     icon: Send,             label: 'Apply'     },
  { to: '/tracker',   icon: KanbanSquare,     label: 'Tracker'   },
  { to: '/analytics', icon: BarChart3,        label: 'Analytics' },
]

export default function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-slate-950 flex">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className={`hidden md:flex flex-col bg-slate-900 border-r border-slate-800 fixed h-full z-10 transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'}`}>

        {/* Logo */}
            <div className={`flex items-center border-b border-slate-800 px-3 py-4 ${collapsed ? 'justify-center' : 'justify-between px-4'}`}>
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 p-2 rounded-lg flex-shrink-0">
                <Rocket className="w-5 h-5 text-white" />
                </div>
                {!collapsed && (
                <div>
                    <h1 className="text-white font-bold text-base leading-none">CareerPilot</h1>
                    <p className="text-blue-400 text-xs mt-1">AI Career Agent</p>
                </div>
                )}
            </div>
            <button
                onClick={() => setCollapsed(!collapsed)}
                className="text-slate-400 hover:text-white hover:bg-slate-800 p-1.5 rounded-lg transition-all"
            >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            </div>

        {/* Nav Links */}
        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${collapsed ? 'justify-center' : ''} ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              title={collapsed ? label : ''}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!collapsed && label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="px-2 py-4 border-t border-slate-800 space-y-1">
          <button
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-white transition-all w-full ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Settings' : ''}
          >
            <Settings className="w-5 h-5 flex-shrink-0" />
            {!collapsed && 'Settings'}
          </button>
          <button
            onClick={() => navigate('/login')}
            className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all w-full ${collapsed ? 'justify-center' : ''}`}
            title={collapsed ? 'Logout' : ''}
          >
            <LogOut className="w-5 h-5 flex-shrink-0" />
            {!collapsed && 'Logout'}
          </button>

          {/* User */}
          {!collapsed && (
            <div className="flex items-center gap-3 px-3 py-3 mt-1">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                M
              </div>
              <div className="min-w-0">
                <p className="text-white text-sm font-medium truncate">Manu EM</p>
                <p className="text-slate-400 text-xs truncate">manu@email.com</p>
              </div>
            </div>
          )}

          
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-20 bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Rocket className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-white font-bold text-base">CareerPilot AI</h1>
        </div>
        <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-slate-400 hover:text-white p-1">
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* ── MOBILE DROPDOWN ── */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed top-14 left-0 right-0 z-20 bg-slate-900 border-b border-slate-800 px-3 py-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              {label}
            </NavLink>
          ))}
        </div>
      )}

      {/* ── MAIN CONTENT ── */}
      <main className={`flex-1 min-h-screen transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="pt-14 md:pt-0">
          <Outlet />
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-slate-900 border-t border-slate-800 flex items-center justify-around px-2 py-2">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 px-1 py-1.5 rounded-lg transition-all ${
                isActive ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </nav>

    </div>
  )
}