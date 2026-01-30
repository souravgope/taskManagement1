import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const auth = useContext(AuthContext);

  if (auth?.loading) {
    return <div className="p-4">Loading user session...</div>;
  }

  // 1. Not Logged In -> Go to Login
  if (!auth?.user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Role not allowed -> Redirect to appropriate dashboard
  if (allowedRoles && !allowedRoles.includes(auth.user.role)) {
    return <Navigate to={auth.user.role === 'Admin' ? '/admin' : '/dashboard'} replace />;
  }

  // 3. Authorized -> Render the page
  return <Outlet />;
};

export default ProtectedRoute;