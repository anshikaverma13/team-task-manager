const Project = require("../models/Project");

exports.addMember = async (req, res) => {
  try {
    const { userId } = req.body;

    const project = await Project.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // ✅ prevent duplicate members
    if (!project.members.includes(userId)) {
      project.members.push(userId);
    }

    await project.save();

    res.json({ message: "Member added", project });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};