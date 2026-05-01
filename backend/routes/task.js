const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const verifyToken = require("../middleware/authMiddleware");

// ✅ CREATE TASK
router.post("/", verifyToken, async (req, res) => {
  try {
    const { title, description, projectId, assignedTo, dueDate } = req.body;

    const task = new Task({
      title,
      description,
      projectId,
      assignedTo,
      dueDate
    });

    await task.save();

    // 🔥 FIX: return task directly
    res.json(task);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ GET ALL TASKS (for logged in user)
router.get("/", verifyToken, async (req, res) => {
  try {
    let tasks;

    if (req.user.role === "admin") {
      tasks = await Task.find()
        .populate("assignedTo", "name"); // ✅ HERE
    } else {
      tasks = await Task.find({ assignedTo: req.user.id })
        .populate("assignedTo", "name"); // ✅ HERE
    }

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ UPDATE TASK STATUS (mark done)
router.patch("/:id", verifyToken, async (req, res) => {
  try {
    const { status } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// ✅ DELETE TASK
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// DELETE ALL TASKS (reset dashboard)
router.delete("/reset/all", async (req, res) => {
  try {
    await Task.deleteMany({});
    res.json({ message: "All tasks deleted. Dashboard reset." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;