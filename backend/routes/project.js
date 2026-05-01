const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const verifyToken = require("../middleware/authMiddleware");

// CREATE PROJECT
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = new Project({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id]
    });

    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET PROJECTS
router.get("/", verifyToken, async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id
    });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ ADD MEMBER (FIXED)
router.patch("/:id/add-member", verifyToken, async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    // prevent duplicate members
    if (!project.members.includes(userId)) {
      project.members.push(userId);
    }

    await project.save();

    res.json(project);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;