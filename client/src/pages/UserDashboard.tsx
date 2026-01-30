import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

const UserDashboard = () => {
  const { logout, user } = useContext(AuthContext)!;
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const fetchMyTasks = async () => {
      try {
        const res = await api.get('/tasks');
        setTasks(res.data);
      } catch (error) {
        console.error('Error fetching tasks', error);
      }
    };
    fetchMyTasks();
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${id}`, { status: newStatus });
      // Update UI locally to reflect change immediately
      setTasks(tasks.map(t => t.id === id ? { ...t, status: newStatus as any } : t));
    } catch (error) {
      alert('Failed to update status');
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Tasks</h1>
          <p className="text-gray-600">Welcome, {user?.email}</p>
        </div>
        <button onClick={logout} className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600">
          Logout
        </button>
      </div>

      {tasks.length === 0 ? (
        <p>No tasks assigned to you yet.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map(task => (
            <div key={task.id} className="p-4 bg-white border rounded shadow">
              <h3 className="text-lg font-bold">{task.title}</h3>
              <p className="mb-4 text-gray-600">{task.description}</p>
              
              <label className="block mb-1 text-xs font-bold text-gray-500 uppercase">
                Status
              </label>
              <select 
                value={task.status} 
                onChange={(e) => handleStatusUpdate(task.id, e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;