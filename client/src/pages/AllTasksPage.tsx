import { useEffect, useState, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Avatar from "../components/Avatar";

/* ================= TYPES ================= */

type TaskStatus = "Pending" | "In Progress" | "Completed";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  assignedTo: string;
  createdAt: string;
  createdBy?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

/* ================= COMPONENT ================= */

const AllTasksPage = () => {
  const { user } = useContext(AuthContext)!;
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [statusFilter, setStatusFilter] = useState<"All" | TaskStatus>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const [createForm, setCreateForm] = useState<{
    title: string;
    description: string;
    assignedTo: string;
    status: TaskStatus;
  }>({
    title: "",
    description: "",
    assignedTo: "",
    status: "Pending",
  });

  /* ================= EFFECTS ================= */

  useEffect(() => {
    fetchTasks();
    fetchUsers();

    if (searchParams.get("create") === "true") {
      setShowCreateModal(true);
    }
  }, []);

  useEffect(() => {
    filterTasks();
  }, [tasks, statusFilter, searchQuery, users]);

  /* ================= API ================= */

  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
      setFilteredTasks(res.data);
    } catch (error) {
      console.error("Error fetching tasks", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (error) {
      console.error("Error fetching users", error);
    }
  };

  /* ================= HELPERS ================= */

  const resolveAssignedTo = (assigned: string) => {
    const found = users.find(
      (u) => u.id === assigned || u.email === assigned || u.username === assigned
    );
    return found ? found.username || found.email : assigned;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTaskId = (id: string) => {
    const shortId = id.substring(0, 3).toUpperCase();
    return `#TSK${shortId.padEnd(3, "0")}`;
  };

  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "In Progress":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const canUpdateTask = (task: Task) => {
    if (!user) return false;
    if (user.role === "Admin") return true;
    return task.assignedTo === user.id;
  };

  /* ================= LOGIC ================= */

  const filterTasks = () => {
    let filtered = [...tasks];

    if (statusFilter !== "All") {
      filtered = filtered.filter((t) => t.status === statusFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((t) => {
        const assignedName = resolveAssignedTo(t.assignedTo).toLowerCase();
        const assignedEmail =
          users.find((u) => u.id === t.assignedTo)?.email?.toLowerCase() || "";

        return (
          t.title.toLowerCase().includes(query) ||
          t.description?.toLowerCase().includes(query) ||
          assignedName.includes(query) ||
          assignedEmail.includes(query) ||
          formatTaskId(t.id).toLowerCase().includes(query)
        );
      });
    }

    setFilteredTasks(filtered);
  };

  const updateTaskStatus = async (taskId: string, newStatus: TaskStatus) => {
    try {
      await api.put(`/tasks/${taskId}`, { status: newStatus });
      await fetchTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({ ...selectedTask, status: newStatus });
      }
    } catch {
      alert("Failed to update status");
    }
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/tasks", createForm);
      setShowCreateModal(false);
      setCreateForm({
        title: "",
        description: "",
        assignedTo: "",
        status: "Pending",
      });
      fetchTasks();
    } catch (error: any) {
      alert(error.response?.data?.message || "Error creating task");
    }
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="px-6 py-8">
        <div className="flex justify-between mb-6">
          <h1 className="text-3xl font-bold">All Tasks</h1>

          {user?.role === "Admin" && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700"
            >
              Create Task
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="mb-6">
          <input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-4 py-2 border rounded-lg w-full max-w-md"
          />
        </div>

        {/* Table */}
        {loading ? (
          <div className="text-center py-12">Loading tasks...</div>
        ) : (
          <div className="bg-white rounded shadow">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left">Task ID</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Assigned To</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredTasks.map((task) => (
                  <tr key={task.id} className="border-t">
                    <td className="px-4 py-2">{formatTaskId(task.id)}</td>
                    <td className="px-4 py-2">{task.title}</td>
                    <td className="px-4 py-2 flex items-center gap-2">
                      <Avatar
                        id={task.assignedTo}
                        name={users.find((u) => u.id === task.assignedTo)?.username}
                        email={users.find((u) => u.id === task.assignedTo)?.email}
                        size={8}
                      />
                      {resolveAssignedTo(task.assignedTo)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusColor(
                          task.status
                        )}`}
                      >
                        {task.status}
                      </span>
                    </td>
                    <td className="px-4 py-2">{formatDate(task.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTasksPage;
