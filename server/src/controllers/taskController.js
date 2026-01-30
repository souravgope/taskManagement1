const { db } = require("../config/firebase");

// @desc    Create a new task
// @access  Admin only
const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, status } = req.body;

    // Validate required fields
    if (!title || !assignedTo) {
      return res
        .status(400)
        .json({ message: "Title and Assigned User are required" });
    }

    const newTask = {
      title,
      description: description || "",
      status: status || "Pending", // Default status [cite: 22]
      assignedTo, // This should be the User ID
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
    };

    const docRef = await db.collection("tasks").add(newTask);
    res.status(201).json({ id: docRef.id, ...newTask });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get tasks
// @access  Private (Admin: All tasks, User: Assigned tasks)
const getTasks = async (req, res) => {
  try {
    const tasksRef = db.collection("tasks");
    let snapshot;

    if (req.user.role === "Admin") {
      // Admin sees ALL tasks [cite: 14]
      snapshot = await tasksRef.get();
    } else {
      // User sees only THEIR assigned tasks [cite: 16]
      // First try matching by Firestore user ID
      snapshot = await tasksRef.where("assignedTo", "==", req.user.id).get();

      // If no tasks found, fallback to matching by user's email or username
      if (snapshot.empty) {
        try {
          const userDoc = await db.collection('users').doc(req.user.id).get();
          if (userDoc.exists) {
            const userData = userDoc.data() || {};
            const fallbacks = [];
            if (userData.email) fallbacks.push(userData.email);
            if (userData.username) fallbacks.push(userData.username);

            for (const val of fallbacks) {
              const altSnapshot = await tasksRef.where('assignedTo', '==', val).get();
              if (!altSnapshot.empty) {
                snapshot = altSnapshot;
                break;
              }
            }
          }
        } catch (err) {
          // If the fallback lookup fails, ignore and continue—returning empty is acceptable
          console.error('Fallback lookup failed in getTasks:', err.message || err);
        }
      }
    }

    if (snapshot.empty) {
      return res.status(200).json([]);
    }

    const tasks = [];
    snapshot.forEach((doc) => {
      tasks.push({ id: doc.id, ...doc.data() });
    });

    res.status(200).json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update task
// @access  Private (Admin: Edit all, User: Update status only)
const updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const taskRef = db.collection("tasks").doc(id);
    const doc = await taskRef.get();

    if (!doc.exists) {
      return res.status(404).json({ message: "Task not found" });
    }

    const taskData = doc.data();

    // Check permissions
    if (req.user.role !== "Admin") {
      // 1. User can only update tasks assigned to them
      let isAssignedToUser = taskData.assignedTo === req.user.id;

      // Fallback: if task was assigned to email or username, allow as well
      try {
        const userDoc = await db.collection('users').doc(req.user.id).get();
        if (userDoc.exists) {
          const userData = userDoc.data() || {};
          if (userData.email && taskData.assignedTo === userData.email) isAssignedToUser = true;
          if (userData.username && taskData.assignedTo === userData.username) isAssignedToUser = true;
        }
      } catch (err) {
        console.error('Fallback lookup failed in updateTask permission check:', err.message || err);
      }

      if (!isAssignedToUser) {
        return res
          .status(403)
          .json({ message: "Not authorized to update this task" });
      }

      // 2. User can ONLY update status [cite: 17]
      // We ignore other fields if a regular user tries to send them
      if (updates.status) {
        await taskRef.update({ status: updates.status });
        return res.json({ id, ...taskData, status: updates.status });
      } else {
        return res
          .status(400)
          .json({ message: "Users can only update task status" });
      }
    }

    // Admin can update any field [cite: 12]
    await taskRef.update(updates);
    const updatedDoc = await taskRef.get();
    res.json({ id: updatedDoc.id, ...updatedDoc.data() });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete task
// @access  Admin only
const deleteTask = async (req, res) => {
  try {
    const { id } = req.params;
    await db.collection("tasks").doc(id).delete();
    res.json({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask };
