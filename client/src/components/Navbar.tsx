import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side - Logo and Search */}
          <div className="flex items-center space-x-6 flex-1">
            <Link to={user?.role === 'Admin' ? '/admin' : '/dashboard'} className="text-xl font-bold text-gray-900">
              Task Management
            </Link>
            
            <div className="flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search here..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Right side - Navigation and User */}
          <div className="flex items-center space-x-4">
            {user?.role === 'Admin' && (
              <span className="px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-full">
                Admin
              </span>
            )}
            
            <Link
              to={user?.role === 'Admin' ? '/admin' : '/dashboard'}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              Dashboard
            </Link>
            
            <Link
              to={user?.role === 'Admin' ? '/admin/tasks' : '/dashboard/tasks'}
              className="px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              Tasks
            </Link>
            
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
