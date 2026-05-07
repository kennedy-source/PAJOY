import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './components/ui/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import AnalyticsPage from './pages/analytics/AnalyticsPage';
import CustomersPage from './pages/customers/CustomersPage';
import ProductsPage from './pages/products/ProductsPage';
import SalesPage from './pages/sales/SalesPage';
import InventoryPage from './pages/inventory/InventoryPage';
import UsersPage from './pages/users/UsersPage';
import SettingsPage from './pages/settings/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-background">
              <Routes>
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/" element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="dashboard" element={<DashboardPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="customers" element={<CustomersPage />} />
                  <Route path="products" element={<ProductsPage />} />
                  <Route path="sales" element={<SalesPage />} />
                  <Route path="inventory" element={<InventoryPage />} />
                  <Route path="users" element={<UsersPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                </Route>
                
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
              
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: 'hsl(var(--background))',
                    color: 'hsl(var(--foreground))',
                    border: '1px solid hsl(var(--border))',
                  },
                }}
              />
            </div>
          </Router>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
