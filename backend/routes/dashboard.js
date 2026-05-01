const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const verifyToken = require("../middleware/authMiddleware");

// DASHBOARD STATS (FULL APP)
router.get("/", verifyToken, async (req, res) => {
  try {
    // 🔹 Total tasks
    const total = await Task.countDocuments();

    // 🔹 Completed
    const completed = await Task.countDocuments({
      status: "done"
    });

    // 🔹 Pending
    const pending = await Task.countDocuments({
      status: { $ne: "done" }
    });

    // 🔹 Overdue
    const overdue = await Task.countDocuments({
      status: { $ne: "done" },
      dueDate: { $lt: new Date() }
    });

    res.json({
      total,
      completed,
      pending,
      overdue
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;