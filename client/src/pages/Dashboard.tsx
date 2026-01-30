import { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  assignedTo: string;
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useContext(AuthContext)!;
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const totalTasks = tasks.length;
  const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
  const completedTasks = tasks.filter(t => t.status === 'Completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'Pending').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="px-6 py-8">
        <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">Total Tasks</h3>
            <p className="text-3xl font-bold text-gray-900">{totalTasks}</p>
            <p className="mt-2 text-sm text-gray-600">All tasks</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">In Progress Tasks</h3>
            <p className="text-3xl font-bold text-blue-600">{inProgressTasks}</p>
            <p className="mt-2 text-sm text-gray-600">Task currently being worked on</p>
          </div>

          <div className="p-6 bg-white rounded-lg shadow-sm border border-gray-200">
            <h3 className="mb-2 text-sm font-medium text-gray-500 uppercase">Completed Tasks</h3>
            <p className="text-3xl font-bold text-green-600">{completedTasks}</p>
            <p className="mt-2 text-sm text-gray-600">Task finished successfully</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Quick actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => navigate(user?.role === 'Admin' ? '/admin/tasks' : '/dashboard/tasks')}
              className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
            >
              <h3 className="font-medium text-gray-900">All tasks</h3>
              <p className="mt-1 text-sm text-gray-600">View and manage all posted tasks</p>
            </button>

            {user?.role === 'Admin' && (
              <button
                onClick={() => navigate('/admin/tasks?create=true')}
                className="p-4 text-left border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
              >
                <h3 className="font-medium text-gray-900">Create Task</h3>
                <p className="mt-1 text-sm text-gray-600">Create new task and post</p>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

