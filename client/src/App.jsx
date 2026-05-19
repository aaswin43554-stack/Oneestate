import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import LotDetail from './pages/LotDetail';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/inventory"
            element={<ProtectedRoute><Inventory /></ProtectedRoute>}
          />
          <Route
            path="/inventory/:id"
            element={<ProtectedRoute><LotDetail /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
