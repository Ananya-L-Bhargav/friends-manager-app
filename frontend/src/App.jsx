import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FriendDetail from './pages/FriendDetail';
import FriendForm from './pages/FriendForm';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Route */}
          <Route path="/login" element={<Login />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          {/* Protected Create Friend Route */}
          <Route
            path="/friends/new"
            element={
              <ProtectedRoute>
                <FriendForm />
              </ProtectedRoute>
            }
          />

          {/* Protected Friend Detail Route */}
          <Route
            path="/friends/:id"
            element={
              <ProtectedRoute>
                <FriendDetail />
              </ProtectedRoute>
            }
          />

          {/* Protected Edit Friend Route */}
          <Route
            path="/friends/:id/edit"
            element={
              <ProtectedRoute>
                <FriendForm />
              </ProtectedRoute>
            }
          />

          {/* Default Root Redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;