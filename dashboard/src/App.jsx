import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import CasesPage from './pages/CasesPage';
import CaseDetailPage from './pages/CaseDetailPage';
import MapPage from './pages/MapPage';
import Sidebar from './components/Sidebar';
import theme from './theme';

const queryClient = new QueryClient();

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function ProtectedLayout() {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: theme.colors.background }}>
      <Sidebar />
      <main style={{ flex: 1, overflow: 'auto' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/cases" element={<CasesPage />} />
          <Route path="/cases/:id" element={<CaseDetailPage />} />
          <Route path="/map" element={<MapPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  const restoreSession = useAuthStore((s) => s.restoreSession);
  useEffect(() => { restoreSession(); }, [restoreSession]);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <ProtectedLayout />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
