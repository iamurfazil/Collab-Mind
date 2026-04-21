import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useStore } from './store';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard'; // <-- NEW: Admin Dashboard Import
import CustomCursor from './components/CustomCursor';
import Toast from './components/Toast';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady } = useStore();
  const location = useLocation();

  if (!isAuthReady) {
    return null;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
}

function AdminOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady, user } = useStore();
  const location = useLocation();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function UserDashboardRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady, user } = useStore();
  const location = useLocation();

  if (!isAuthReady) {
    return null;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAuthReady, user } = useStore(); // <-- Added user to check role

  if (!isAuthReady) {
    return null;
  }
  
  if (isAuthenticated) {
    // Make sure admins go to their specific dashboard if they hit the auth page
    if (user?.role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
}

function ScrollToTop() {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
}

export default function App() {
  const [mounted, setMounted] = useState(false);
  const initializeAuth = useStore(state => state.initializeAuth);
  
  useEffect(() => {
    setMounted(true);
    initializeAuth();
  }, [initializeAuth]);
  
  if (!mounted) return null;
  
  return (
    <BrowserRouter>
      <ScrollToTop />
      <div className="min-h-screen bg-[#F8FAFC] text-[#111827]">
        <Toast />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route 
            path="/auth" 
            element={
              <PublicOnlyRoute>
                <AuthPage />
              </PublicOnlyRoute>
            } 
          />
          <Route 
            path="/dashboard/*" 
            element={
              <UserDashboardRoute>
                <Dashboard />
              </UserDashboardRoute>
            } 
          />
          {/* --- NEW ADMIN DASHBOARD ROUTE --- */}
          <Route 
            path="/admin/*" 
            element={
              <AdminOnlyRoute>
                <AdminDashboard />
              </AdminOnlyRoute>
            } 
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}