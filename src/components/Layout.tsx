import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Receipt,
  Wallet,
  Plus,
  Eye,
  Menu,
  X,
  Settings
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}



const Layout = ({ children }: LayoutProps) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768; // md breakpoint
      setIsMobile(mobile);
      if (mobile) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/customers', icon: Users, label: 'Customers' },
    { path: '/add-sale', icon: ShoppingCart, label: 'Add Sale' },
    { path: '/add-customer', icon: Plus, label: 'Add Customer' },
    { path: '/sales', icon: Receipt, label: 'Sales' },
    { path: '/cashbook', icon: Wallet, label: 'Cashbook' },
    { path: '/add-expense', icon: Plus, label: 'Add Expense' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed top-0 left-0 h-full bg-card border-r border-border transition-all duration-300 z-30
          ${isMobile
            ? (sidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')
            : (sidebarOpen ? 'w-64' : 'w-20')
          }
        `}
      >
        {/* Logo & Toggle */}
        <div className="p-4 border-b border-border flex items-center justify-between">
          {(sidebarOpen || isMobile) && (
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-primary" />
              <div>
                <h1 className="font-bold text-lg text-foreground">Vision Point</h1>
                <p className="text-xs text-muted-foreground">Optical Management</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2 hover:bg-accent rounded-lg transition-colors ${!sidebarOpen && !isMobile ? 'mx-auto' : ''}`}
          >
            {sidebarOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => isMobile && setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${active
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'hover:bg-accent text-foreground'
                  } ${!sidebarOpen && !isMobile ? 'justify-center px-2' : ''}`}
                title={!sidebarOpen && !isMobile ? item.label : ''}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {(sidebarOpen || isMobile) && <span className="font-medium">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Top Bar (Only visible on mobile when sidebar is closed) */}
      {isMobile && !sidebarOpen && (
        <div className="fixed top-0 left-0 right-0 h-16 bg-card border-b border-border flex items-center px-4 z-10 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-accent rounded-lg transition-colors mr-3"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <Eye className="w-6 h-6 text-primary" />
            <h1 className="font-bold text-lg text-foreground">Vision Point</h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        className={`flex-1 transition-all duration-300 ${isMobile ? 'ml-0 mt-16 p-4' : (sidebarOpen ? 'ml-64' : 'ml-20')
          }`}
      >
        <div className={`h-full ${!isMobile ? 'p-6 md:p-8' : ''}`}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
