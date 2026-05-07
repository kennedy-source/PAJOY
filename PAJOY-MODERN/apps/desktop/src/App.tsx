import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ThemeProvider } from './components/ui/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { DatabaseProvider } from './contexts/DatabaseContext';
import { SyncProvider } from './contexts/SyncContext';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

// Pages
import LoginPage from './pages/auth/LoginPage';
import DashboardPage from './pages/dashboard/DashboardPage';
import POSPage from './pages/pos/POSPage';
import ProductsPage from './pages/products/ProductsPage';
import CustomersPage from './pages/customers/CustomersPage';
import SalesPage from './pages/sales/SalesPage';
import EmbroideryPage from './pages/embroidery/EmbroideryPage';
import PrintingPage from './pages/printing/PrintingPage';
import ReportsPage from './pages/reports/ReportsPage';
import SettingsPage from './pages/settings/SettingsPage';
import InventoryPage from './pages/inventory/InventoryPage';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <DatabaseProvider>
            <SyncProvider>
              <Router>
                <div className="min-h-screen bg-background">
                  <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<LoginPage />} />
                    
                    {/* Protected Routes */}
                    <Route path="/" element={
                      <ProtectedRoute>
                        <Layout />
                      </ProtectedRoute>
                    }>
                      <Route index element={<Navigate to="/dashboard" replace />} />
                      <Route path="dashboard" element={<DashboardPage />} />
                      <Route path="pos" element={<POSPage />} />
                      <Route path="products" element={<ProductsPage />} />
                      <Route path="customers" element={<CustomersPage />} />
                      <Route path="sales" element={<SalesPage />} />
                      <Route path="embroidery" element={<EmbroideryPage />} />
                      <Route path="printing" element={<PrintingPage />} />
                      <Route path="reports" element={<ReportsPage />} />
                      <Route path="inventory" element={<InventoryPage />} />
                      <Route path="settings" element={<SettingsPage />} />
                    </Route>
                    
                    {/* 404 Route */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                  </Routes>
                  
                  {/* Global Toast Container */}
                  <Toaster
                    position="top-right"
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'hsl(var(--background))',
                        color: 'hsl(var(--foreground))',
                        border: '1px solid hsl(var(--border))',
                      },
                      success: {
                        iconTheme: {
                          primary: 'hsl(var(--primary))',
                          secondary: 'hsl(var(--primary-foreground))',
                        },
                      },
                      error: {
                        iconTheme: {
                          primary: 'hsl(var(--destructive))',
                          secondary: 'hsl(var(--destructive-foreground))',
                        },
                      },
                    }}
                  />
                </div>
              </Router>
            </SyncProvider>
          </DatabaseProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
