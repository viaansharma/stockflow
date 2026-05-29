import { NavLink, useLocation } from 'react-router-dom';
import {
  Package, Users, ShoppingCart, LayoutDashboard,
  TrendingUp, Menu, X, Boxes
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
];

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-ink-900/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-ink-950 flex flex-col
          transform transition-transform duration-300 ease-in-out
          lg:static lg:translate-x-0
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-ink-800">
          <div className="w-9 h-9 bg-amber-400 rounded-xl flex items-center justify-center flex-shrink-0">
            <Boxes size={18} className="text-ink-950" />
          </div>
          <div>
            <h1 className="font-display text-white text-lg leading-none">StockFlow</h1>
            <p className="text-ink-500 text-xs mt-0.5">Inventory System</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
          <p className="px-3 text-ink-600 text-xs uppercase tracking-widest font-medium mb-3">
            Main Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? 'bg-amber-400/15 text-amber-400'
                  : 'text-ink-400 hover:text-ink-100 hover:bg-ink-800'
                }`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-ink-800">
          <p className="text-ink-600 text-xs">
            © 2025 StockFlow v1.0
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-ink-100 px-4 lg:px-8 py-4 flex items-center gap-4">
          <button
            className="lg:hidden p-2 rounded-lg text-ink-500 hover:bg-ink-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-2 text-sm text-ink-500">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="hidden sm:block">System Online</span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
