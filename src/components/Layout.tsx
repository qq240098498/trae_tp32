import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, BatteryPlus, List, ScanLine, Plug } from 'lucide-react'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/batteries', icon: List, label: '电池列表' },
  { to: '/appliance-pairings', icon: Plug, label: '电器配对' },
  { to: '/batteries/add', icon: BatteryPlus, label: '添加电池' },
  { to: '/scan', icon: ScanLine, label: '扫码录入' },
]

export default function Layout() {
  return (
    <div className="min-h-screen battery-gradient flex">
      <aside className="hidden md:flex w-64 flex-col border-r border-battery-border bg-battery-surface/50 backdrop-blur-sm">
        <div className="p-6 border-b border-battery-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-battery-accent/20 flex items-center justify-center">
              <BatteryPlus className="w-5 h-5 text-battery-accent" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg text-battery-text">电池管家</h1>
              <p className="text-xs text-battery-muted">家用电池管理工具</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-battery-accent/15 text-battery-accent glow-accent'
                    : 'text-battery-muted hover:bg-battery-card hover:text-battery-text'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium text-sm">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-battery-border">
          <div className="px-4 py-3 rounded-xl bg-battery-card/50 text-xs text-battery-muted">
            数据存储在本地浏览器中
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="p-6 md:p-8 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-battery-surface/95 backdrop-blur-md border-t border-battery-border z-50">
        <div className="flex justify-around py-2">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                  isActive ? 'text-battery-accent' : 'text-battery-muted'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  )
}
