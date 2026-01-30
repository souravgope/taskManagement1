const express = require("express");
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
} = require("../controllers/taskController");
const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/roleMiddleware");

const router = express.Router();

// All task routes need Authentication
router.use(protect);

// Routes
router
  .route("/")
  .get(getTasks) // Admin: All, User: Assigned
  .post(adminOnly, createTask); // Admin only [cite: 12]

router
  .route("/:id")
  .put(updateTask) // Logic inside controller handles role diffs
  .delete(adminOnly, deleteTask); // Admin only [cite: 12]

module.exports = router;
