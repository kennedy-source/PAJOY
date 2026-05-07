import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Layout as LayoutIcon, 
  ShoppingCart, 
  Package, 
  Users, 
  Receipt, 
  Shirt, 
  Printer, 
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X,
  Store,
  CreditCard
} from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import { useSyncStatus } from '../../contexts/SyncContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutIcon },
  { name: 'POS', href: '/pos', icon: ShoppingCart },
  { name: 'Products', href: '/products', icon: Package },
  { name: 'Customers', href: '/customers', icon: Users },
  { name: 'Sales', href: '/sales', icon: Receipt },
  { name: 'Embroidery', href: '/embroidery', icon: Shirt },
  { name: 'Printing', href: '/printing', icon: Printer },
  { name: 'Inventory', href: '/inventory', icon: Store },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { isOnline, pendingOperations } = useSyncStatus();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-25 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Store className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">PAJOY</h1>
                <p className="text-xs text-muted-foreground">Uniforms POS</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden ml-auto"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Button
                  key={item.name}
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start",
                    isActive && "bg-secondary"
                  )}
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <item.icon className="w-4 h-4 mr-3" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* User section */}
          <div className="border-t border-border p-4">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-muted-foreground">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role}
                </p>
              </div>
            </div>
            
            {/* Sync Status */}
            <div className="flex items-center justify-between mb-4 p-2 bg-muted rounded-lg">
              <div className="flex items-center space-x-2">
                <div className={cn(
                  "w-2 h-2 rounded-full",
                  isOnline ? "bg-green-500" : "bg-yellow-500"
                )} />
                <span className="text-xs text-muted-foreground">
                  {isOnline ? "Online" : "Offline"}
                </span>
              </div>
              {pendingOperations > 0 && (
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  {pendingOperations}
                </span>
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-sm text-muted-foreground">
                Pesapal: Active
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">
                {new Date().toLocaleDateString('en-KE', { 
                  weekday: 'short', 
                  year: 'numeric', 
                  month: 'short', 
                  day: 'numeric' 
                })}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date().toLocaleTimeString('en-KE', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
