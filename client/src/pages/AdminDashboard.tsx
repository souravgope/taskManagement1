import { useEffect, useState, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import Avatar from '../components/Avatar';
import TaskCard from '../components/TaskCard';

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedTo: string;
}

const AdminDashboard = () => {
  const { logout } = useContext(AuthContext)!;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string; email: string }[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '' // will be a user id selected from dropdown
  });

  // Fetch all tasks & users on load
  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(t => t.id !== id));
    } catch (error) {
      alert('Failed to delete task');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.assignedTo) return alert('Please select a user to assign the task to.');
      const res = await api.post('/tasks', formData);
      setTasks([...tasks, res.data]);
      setFormData({ title: '', description: '', assignedTo: '' }); // Reset form
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating task. Ensure User ID is valid.');
    }
  };

  const resolveAssignedTo = (assigned: string) => {
    const found = users.find(u => u.id === assigned || u.email === assigned || u.username === assigned);
    return found ? (found.username || found.email) : assigned;
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="flex justify-between mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button onClick={logout} className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Create Task Form */}
      <div className="p-6 mb-8 bg-white rounded shadow">
        <h2 className="mb-4 text-xl font-semibold">Assign New Task</h2>
        <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-4">
          <input
            placeholder="Task Title"
            value={formData.title}
            onChange={e => setFormData({ ...formData, title: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            placeholder="Description"
            value={formData.description}
            onChange={e => setFormData({ ...formData, description: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={formData.assignedTo}
            onChange={e => setFormData({ ...formData, assignedTo: e.target.value })}
            className="p-2 border rounded"
            required
          >
            <option value="">Select a user</option>
            {users.map(u => (
              <option key={u.id} value={u.id}>
                {u.username || u.email} {u.username ? `(${u.email})` : ''}
              </option>
            ))}
          </select>
          <button type="submit" className="px-4 py-2 text-white bg-green-600 rounded hover:bg-green-700">
            Create Task
          </button>
        </form>
      </div>

      {/* Task List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tasks.map(task => (
          <TaskCard 
            key={task.id}
            task={task}
            assignedName={users.find(u => u.id === task.assignedTo)?.username}
            assignedEmail={users.find(u => u.id === task.assignedTo)?.email}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;