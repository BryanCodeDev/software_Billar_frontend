import { useState } from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import {  
  LayoutDashboard, 
  Users, 
  Package, 
  UserCheck,
  Settings,
  Menu,
  X,
  Circle
} from 'lucide-react';

const navigation = [
  { name: 'Mesas', path: '/', icon: LayoutDashboard },
  { name: 'Jugadores', path: '/jugadores', icon: Users },
  { name: 'Inventario', path: '/inventario', icon: Package },
  { name: 'Clientes', path: '/clientes', icon: UserCheck },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-billar-blue-night">
      {/* Mobile Header - only visible on small screens */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-billar-green-dark border-b border-white/10 flex items-center justify-between px-4">
        <button 
          onClick={() => setMobileMenuOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu size={24} />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-billar-gold flex items-center justify-center">
            <Circle className="w-4 h-4 fill-billar-green-dark text-billar-green-dark" />
          </div>
          <span className="font-bold text-billar-gold">Billar Pro</span>
        </div>
        <div className="w-10"></div>
      </div>

      {/* Mobile Menu Overlay - slides from left */}
      <div 
        className={`lg:hidden fixed inset-0 z-40 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      >
        <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)}></div>
        <div className={`absolute top-0 left-0 bottom-0 w-72 bg-billar-green-dark border-r border-white/10 transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-billar-gold flex items-center justify-center">
                <Circle className="w-4 h-4 fill-billar-green-dark text-billar-green-dark" />
              </div>
              <span className="font-bold text-billar-gold">Billar Pro</span>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive 
                      ? 'bg-billar-gold text-billar-green-dark font-medium' 
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
            <Link
              to="/config"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors ${
                location.pathname === '/config' ? 'bg-white/10' : ''
              }`}
            >
              <Settings size={20} />
              <span>Configuración</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Desktop Sidebar - visible on lg screens (1024px+) */}
      <aside 
        className={`hidden lg:block fixed top-0 left-0 z-40 h-screen transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-billar-green-dark border-r border-white/10`}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-billar-gold flex items-center justify-center flex-shrink-0">
                <Circle className="w-4 h-4 fill-billar-green-dark text-billar-green-dark" />
              </div>
              <span className="font-bold text-billar-gold whitespace-nowrap">Billar Pro</span>
            </div>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Navigation - flex column to stack items */}
        <nav className="p-4 space-y-2 flex flex-col">
          {navigation.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive 
                    ? 'bg-billar-gold text-billar-green-dark font-medium' 
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                <item.icon size={20} className="flex-shrink-0" />
                {sidebarOpen && <span className="whitespace-nowrap truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section - fixed at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10">
          <Link
            to="/config"
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:bg-white/10 transition-colors ${
              location.pathname === '/config' ? 'bg-white/10' : ''
            }`}
          >
            <Settings size={20} className="flex-shrink-0" />
            {sidebarOpen && <span>Configuración</span>}
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className={`pt-16 lg:pt-0 transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'}`}>
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
