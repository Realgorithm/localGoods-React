import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import MainLayout from './layouts/MainLayout';
import RoleProtectedRoute from './components/RoleProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import 'bootstrap/dist/css/bootstrap.min.css';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './styles/Animations.css';
import './styles/GenZTheme.css';

// Optimization: Lazy load pages for better performance and code splitting.
// This means the user only downloads the code for the page they are viewing.
const HomePage = lazy(() => import('./pages/HomePage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const CustomersPage = lazy(() => import('./pages/CustomersPage'));
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const ReceivingPage = lazy(() => import('./pages/ReceivingPage'));
const TransactionPage = lazy(() => import('./pages/TransactionPage'));
const SupplierPaymentsPage = lazy(() => import('./pages/SupplierPaymentsPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const UserManagementPage = lazy(() => import('./pages/UserManagementPage'));
const UnauthorizedPage = lazy(() => import('./pages/UnauthorizedPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const CustomerPaymentsPage = lazy(() => import('./pages/CustomerPaymentsPage'));

const CategoriesPage = lazy(() => import('./pages/CategoriesPage'));
// A simple fallback component to show while pages are loading.
const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'rgb(15, 23, 42)' }}>
    <span style={{ color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>Loading...</span>
  </div>
);

const AppContent = () => {
  const location = useLocation();
  const { theme } = useTheme();
  const { loading } = useAuth();

  if (loading) {
    return <LoadingFallback />;
  }

  return (
    <>
      <Suspense fallback={<LoadingFallback />}>
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            {/* Public routes with shared layout */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            </Route>

            {/* Protected routes - After Login */}
            <Route
              element={<ProtectedRoute><MainLayout /></ProtectedRoute>}
            >
              <Route path="/app" element={<Navigate to="/dashboard" />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="customers" element={<CustomersPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="sales" element={<SalesPage />} />
              <Route path="receiving" element={<ReceivingPage />} />
              <Route path="transaction/:saleId" element={<TransactionPage />} />
              <Route path="customer-payments" element={<CustomerPaymentsPage />} />
              <Route path="unauthorized" element={<UnauthorizedPage />} />

              {/* Admin Only Routes */}
              <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="supplier-payments" element={<SupplierPaymentsPage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="user-management" element={<UserManagementPage />} />
                <Route path="categories" element={<CategoriesPage />} />
              </Route>
            </Route>
          </Routes>
        </AnimatePresence>
      </Suspense>
      <ToastContainer position="bottom-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme={theme} />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;