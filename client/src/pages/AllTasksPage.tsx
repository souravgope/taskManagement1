import { useEffect, useState, useContext } from 'react';
import Avatar from '../components/Avatar';
import { useSearchParams } from 'react-router-dom';
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
  createdBy?: string;
}

const AllTasksPage = () => {
  const { user } = useContext(AuthContext)!;
  const [searchParams] = useSearchParams();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<{ id: string; username: string; email: string }[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    assignedTo: '',
    status: 'Pending'
  });

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    const create = searchParams.get('create');
    if (create === 'true') {
      setShowCreateModal(true);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };
  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter, searchQuery]);

  const fetchTasks = async () => {
    try {
      const res = await api.get('/tasks');
      setTasks(res.data);
      setFilteredTasks(res.data);
    } catch (error) {
      console.error('Error fetching tasks', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTasks = () => {
    let filtered = tasks;

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => {
        const assignedName = resolveAssignedTo(t.assignedTo).toLowerCase();
        const assignedEmail = (users.find(u => u.id === t.assignedTo)?.email || '').toLowerCase();

        return (
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          t.assignedTo.toLowerCase().includes(query) ||
          assignedName.includes(query) ||
          assignedEmail.includes(query) ||
          formatTaskId(t.id).toLowerCase().includes(query)
        );
      });
    }

    setFilteredTasks(filtered);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const formatTaskId = (id: string) => {
    // Use first 3 characters of the ID, or pad with zeros if needed
    const shortId = id.substring(0, 3).toUpperCase();
    // If ID is shorter than 3 chars, pad with zeros
    return `#TSK${shortId.padEnd(3, '0')}`;
  };

  const resolveAssignedTo = (assigned: string) => {
    const found = users.find(u => u.id === assigned || u.email === assigned || u.username === assigned);
    return found ? (found.username || found.email) : assigned;
  };

  const canUpdateTask = (task: Task) => {
    if (!user) return false;
    if (user.role === 'Admin') return true;
    // check by id/email/username
    if (task.assignedTo === user.id) return true;

    const found = users.find(u => u.id === user.id);
    if (found) {
      if (task.assignedTo === found.email || task.assignedTo === found.username) return true;
    }

    return false;
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await fetchTasks();
      // update selectedTask if open
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!createForm.assignedTo) return alert('Please select a user to assign the task to.');
      await api.post('/tasks', createForm);
      setShowCreateModal(false);
      setCreateForm({ title: '', description: '', assignedTo: '', status: 'Pending' });
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleViewTask = (task: Task) => {
    setSelectedTask(task);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'Pending':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Tasks</h1>
            <p className="mt-2 text-gray-600">Manage, assign, and track tasks across your team.</p>
          </div>
          
          {user?.role === 'Admin' && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Task
            </button>
          )}
        </div>

        {/* Search and Status Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex space-x-2 border-b border-gray-200">
            {['All', 'Pending', 'Completed', 'In Progress'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-4 py-2 font-medium transition-colors ${
                  statusFilter === status
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Tasks Table */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="text-center py-12 text-gray-500">No tasks found</div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Task Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assigned To
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created On
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatTaskId(task.id)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{task.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div className="flex items-center">
                        {/* Avatar + name */}
                        <div className="mr-3">
                          {/* @ts-ignore */}
                          <Avatar id={task.assignedTo} name={users.find(u => u.id === task.assignedTo)?.username} email={users.find(u => u.id === task.assignedTo)?.email} size={8} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{resolveAssignedTo(task.assignedTo)}</div>
                          <div className="text-xs text-gray-500">{users.find(u => u.id === task.assignedTo)?.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(task.status)}`}>
                        {task.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {task.createdAt ? formatDate(task.createdAt) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleViewTask(task)}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold mb-4">Create Task</h2>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Task Title</label>
                <input
                  type="text"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Description</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Assigned To</label>
                <select
                  value={createForm.assignedTo}
                  onChange={(e) => setCreateForm({ ...createForm, assignedTo: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a user</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.username || u.email} {u.username ? `(${u.email})` : ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-700">Status</label>
                <select
                  value={createForm.status}
                  onChange={(e) => setCreateForm({ ...createForm, status: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setCreateForm({ title: '', description: '', assignedTo: '', status: 'Pending' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Task Details</h2>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-6">
              {/* Header: Avatar + Title + Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* @ts-ignore */}
                  <Avatar id={selectedTask.assignedTo} name={users.find(u => u.id === selectedTask.assignedTo)?.username} email={users.find(u => u.id === selectedTask.assignedTo)?.email} size={12} />
                  <div>
                    <h3 className="text-2xl font-semibold">{selectedTask.title}</h3>
                    <div className="text-sm text-gray-500">Assigned to {resolveAssignedTo(selectedTask.assignedTo)}</div>
                  </div>
                </div>

                <div className="text-right">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedTask.status)}`}>
                    {selectedTask.status}
                  </span>
                  <div className="text-xs text-gray-500 mt-2">{selectedTask.createdAt ? formatDate(selectedTask.createdAt) : 'N/A'}</div>
                </div>
              </div>

              {/* Status Update - visible to assignee or admin */}
              {canUpdateTask(selectedTask) && (
                <div>
                  <h4 className="text-lg font-semibold mb-2">Update Status</h4>
                  <div className="flex items-center space-x-3 mb-2">
                    <select
                      value={selectedTask.status}
                      onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value as any })}
                      className="px-3 py-2 border rounded"
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <button
                      onClick={() => updateTaskStatus(selectedTask.id, selectedTask.status)}
                      className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700"
                    >
                      Update
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700">Task ID</h4>
                  <p className="mt-1 text-gray-900">{formatTaskId(selectedTask.id)}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700">Description</h4>
                  <p className="mt-1 text-gray-900">{selectedTask.description || 'No description provided for this task.'}</p>
                </div>
              </div>

              {/* Activity timeline */}
              <div>
                <h4 className="text-lg font-semibold mb-3">Activity</h4>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="mr-3">
                      <div className="w-3 h-3 bg-gray-400 rounded-full mt-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Task created</div>
                      <div className="text-xs text-gray-500">{selectedTask.createdAt ? `${formatDate(selectedTask.createdAt)}, ${new Date(selectedTask.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}` : 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="mr-3">
                      <div className="w-3 h-3 bg-blue-400 rounded-full mt-2" />
                    </div>
                    <div>
                      <div className="text-sm font-medium">Current status</div>
                      <div className="text-xs text-gray-500">{selectedTask.status}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTasksPage;

