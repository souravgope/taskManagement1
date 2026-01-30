import { useNavigate } from 'react-router-dom';

const RoleSelectionPage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-2xl p-8">
        <h1 className="mb-2 text-3xl font-bold text-center text-gray-900">Choose Your Role</h1>
        <p className="mb-8 text-center text-gray-600">
          Select how you want to use the dashboard. You can't change this later without admin support.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Admin Card */}
          <div 
            onClick={() => navigate('/signup?role=Admin')}
            className="p-8 bg-white border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Admin</h2>
            <p className="mb-6 text-gray-600">
              Create, assign, and manage tasks across all users.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Create, edit, and delete tasks
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Assign tasks to users
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                View all tasks and users
              </li>
            </ul>
            <button className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Continue as Admin
            </button>
          </div>

          {/* User Card */}
          <div 
            onClick={() => navigate('/signup?role=User')}
            className="p-8 bg-white border-2 border-gray-200 rounded-lg cursor-pointer transition-all hover:border-blue-500 hover:shadow-lg"
          >
            <h2 className="mb-4 text-2xl font-bold text-gray-900">User</h2>
            <p className="mb-6 text-gray-600">
              View and manage tasks assigned to you.
            </p>
            <ul className="mb-6 space-y-2 text-sm text-gray-600">
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                View assigned tasks
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Update task status
              </li>
              <li className="flex items-center">
                <span className="mr-2">✓</span>
                Track your progress
              </li>
            </ul>
            <button className="w-full px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors">
              Continue as User
            </button>
          </div>
        </div>

        <p className="mt-6 text-sm text-center text-gray-500">
          Already have an account?{' '}
          <button 
            onClick={() => navigate('/login')}
            className="text-blue-600 hover:underline"
          >
            Log in
          </button>
        </p>
      </div>
    </div>
  );
};

export default RoleSelectionPage;

