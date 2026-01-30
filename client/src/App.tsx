import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Import Pages
import RoleSelectionPage from './pages/RoleSelectionPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import AllTasksPage from './pages/AllTasksPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/role-selection" element={<RoleSelectionPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected: Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/tasks" element={<AllTasksPage />} />
          </Route>

          {/* Protected: User Routes */}
          <Route element={<ProtectedRoute allowedRoles={['User']} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/tasks" element={<AllTasksPage />} />
          </Route>

          {/* Default Redirect */}
          <Route path="/" element={<Navigate to="/role-selection" />} />
          <Route path="*" element={<Navigate to="/role-selection" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;