import { useEffect, useState } from "react";
import API from "../services/api";

import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

// ✅ Card outside
const Card = ({ title, value }) => (
  <div className="bg-white/5 backdrop-blur-lg p-5 rounded-2xl border border-white/10">
    <h3 className="text-gray-400">{title}</h3>
    <p className="text-3xl font-bold text-white">{value || 0}</p>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState({});
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);

  const [projectId, setProjectId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [memberId, setMemberId] = useState("");
const [users, setUsers] = useState([]);
const [assignedUser, setAssignedUser] = useState("");

  // ✅ FIX: move here
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const fetchAll = async () => {
    try {
      const [dash, taskRes, projRes, userRes] = await Promise.all([
  API.get("/dashboard"),
  API.get("/tasks"),
  API.get("/projects"),
  API.get("/users"), // ✅ NEW
]);

setUsers(userRes.data);

      setData(dash.data);
      setTasks(taskRes.data);
      setProjects(projRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const getColor = (status) => {
    if (status === "done") return "bg-green-500/20 text-green-400";
    if (status === "todo") return "bg-yellow-500/20 text-yellow-400";
    return "bg-blue-500/20 text-blue-400";
  };

  const createProject = async () => {
    try {
      const res = await API.post("/projects", {
        name: projectName,
        description: "New Project",
      });

      setProjects((prev) => [...prev, res.data.project]); // ✅ fix
      setProjectName("");
    } catch {
      alert("Error creating project");
    }
  };

  const createTask = async () => {
  try {
    const res = await API.post("/tasks", {
      title,
      description: "New Task",
      projectId,
      dueDate,
      assignedTo: assignedUser, // ✅ ADD THIS
    });

    const newTask = res.data.task;

    setTasks((prev) => [...prev, newTask]);

    setData((prev) => ({
      ...prev,
      total: (prev.total || 0) + 1,
      pending: (prev.pending || 0) + 1,
    }));

    setTitle("");
    setDueDate("");
    setAssignedUser(""); // ✅ reset
  } catch {
    alert("Error creating task");
  }
};
const updateStatus = async (id, newStatus) => {
  try {
    await API.patch(`/tasks/${id}`, { status: newStatus });

    setTasks((prev) =>
      prev.map((t) =>
        t._id === id ? { ...t, status: newStatus } : t
      )
    );

    // 🔥 update dashboard counts
    fetchAll();

  } catch {
    alert("Error updating status");
  }
};

  const deleteTask = async (id, status) => {
    try {
      await API.delete(`/tasks/${id}`);

      setTasks((prev) => prev.filter((t) => t._id !== id));

      setData((prev) => ({
        ...prev,
        total: prev.total - 1,
        pending: status === "todo" ? prev.pending - 1 : prev.pending,
        completed: status === "done" ? prev.completed - 1 : prev.completed,
      }));
    } catch {
      alert("Error deleting task");
    }
  };

  const markDone = async (id) => {
    try {
      await API.patch(`/tasks/${id}`, { status: "done" });

      setTasks((prev) =>
        prev.map((t) =>
          t._id === id ? { ...t, status: "done" } : t
        )
      );

      setData((prev) => ({
        ...prev,
        completed: (prev.completed || 0) + 1,
        pending: (prev.pending || 0) - 1,
      }));
    } catch {
      alert("Error updating task");
    }
  };

  const addMember = async (projectId) => {
    try {
      await API.patch(`/projects/${projectId}/add-member`, {
        userId: memberId.trim(),
      });

      setMemberId("");
      fetchAll();
    } catch {
      alert("Error adding member");
    }
  };
  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/"; // go to login
};

const chartData = [
  { name: "Completed", value: data.completed || 0 },
  { name: "Pending", value: data.pending || 0 },
  { name: "Overdue", value: data.overdue || 0 },
];

const COLORS = ["#22c55e", "#facc15", "#ef4444"];
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f0f] via-[#1a1a2e] to-[#16213e] text-white p-6">

      <div className="flex justify-between items-center mb-6">
  <h1 className="text-4xl font-bold">Dashboard</h1>

  <button
    onClick={handleLogout}
    className="bg-red-500 px-4 py-2 rounded"
  >
    Logout
  </button>
</div>

      <p className="text-center text-gray-400 mb-6">
        Logged in as: {role}
      </p>

      {/* ✅ ADMIN ONLY */}
      {role === "admin" && (
        <>
          {/* Create Project */}
          <div className="mb-6 flex gap-2">
            <input
              value={projectName}
              className="p-2 rounded bg-[#2a2a2a]"
              placeholder="New Project"
              onChange={(e) => setProjectName(e.target.value)}
            />
            <button onClick={createProject} className="bg-blue-500 px-4 rounded">
              Create Project
            </button>
          </div>
        </>
      )}

      {/* Task Creation (optional: restrict if needed) */}
      {role === "admin" && (
      <div className="mb-6 flex flex-col gap-2">
        <input
          value={title}
          className="p-2 rounded bg-[#2a2a2a]"
          placeholder="Task Title"
          onChange={(e) => setTitle(e.target.value)}
        />

        <select
          className="p-2 rounded bg-[#2a2a2a]"
          onChange={(e) => setProjectId(e.target.value)}
        >
          <option value="">Select Project</option>
          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
  value={assignedUser}
  onChange={(e) => setAssignedUser(e.target.value)}
  className="p-2 rounded bg-[#2a2a2a]"
>
  <option value="">Assign User</option>
  {users.map((u) => (
    <option key={u._id} value={u._id}>
      {u.name}
    </option>
  ))}
</select>

        <input
          type="date"
          value={dueDate}
          className="p-2 rounded bg-[#2a2a2a]"
          onChange={(e) => setDueDate(e.target.value)}
        />

        <button onClick={createTask} className="bg-blue-500 px-4 py-2 rounded">
          Add Task
        </button>
      </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="mt-10 flex justify-center">
  <PieChart width={300} height={300}>
    <Pie
      data={chartData}
      cx="50%"
      cy="50%"
      outerRadius={100}
      dataKey="value"
    >
      {chartData.map((entry, index) => (
        <Cell key={index} fill={COLORS[index]} />
      ))}
    </Pie>
    <Tooltip />
    <Legend />
  </PieChart>
</div>
        <Card title="Total Tasks" value={data.total} />
        <Card title="Completed" value={data.completed} />
        <Card title="Pending" value={data.pending} />
        <Card title="Overdue" value={data.overdue} />
      </div>

      {/* Projects */}
      <h2 className="mt-8 text-xl font-semibold">Projects</h2>
      {projects.map((project) => (
        <div key={project._id} className="bg-white/5 p-3 mt-2 rounded border border-white/10">
          <p className="font-semibold">{project.name}</p>

          <p className="text-xs text-gray-400">
            Members: {project.members?.length || 0}
          </p>

          {/* ✅ ADMIN ONLY */}
          {role === "admin" && (
            <div className="flex gap-2 mt-2">
              <select
  value={memberId}
  onChange={(e) => setMemberId(e.target.value)}
  className="p-1 rounded bg-[#2a2a2a]"
>
  <option value="">Select User</option>
  {users.map((u) => (
    <option key={u._id} value={u._id}>
      {u.name} ({u.email})
    </option>
  ))}
</select>
              <button
                onClick={() => addMember(project._id)}
                className="text-xs bg-blue-500 px-2 py-1 rounded"
              >
                Add Member
              </button>
            </div>
          )}
        </div>
      ))}

      {/* Tasks */}
      <h2 className="mt-8 text-xl font-semibold">Tasks</h2>

      {tasks.map((task) => {
        const isOverdue =
          task.status !== "done" && new Date(task.dueDate) < new Date();

        return (
          <div
            key={task._id}
            className={`bg-white/5 p-4 mt-3 rounded-xl border ${
              isOverdue ? "border-red-500 bg-red-500/10" : "border-white/10"
            }`}
          >
            <p className="font-semibold">{task.title}</p>
            <p className="text-xs text-gray-400">
  Assigned to: {task.assignedTo?.name || "N/A"}
</p>

            <div className="flex items-center gap-3 mt-2">
             <select
  value={task.status}
  onChange={(e) => updateStatus(task._id, e.target.value)}
  className="p-1 rounded bg-[#2a2a2a] text-xs"
>
  <option value="todo">TODO</option>
  <option value="in-progress">IN PROGRESS</option>
  <option value="done">DONE</option>
</select>

              {task.status !== "done" && (
                <button
                  onClick={() => markDone(task._id)}
                  className="text-xs bg-green-500 px-2 py-1 rounded"
                >
                  Done
                </button>
              )}

              <button
                onClick={() => deleteTask(task._id, task.status)}
                className="text-xs bg-red-500 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>

            {isOverdue && (
              <div className="mt-1 text-red-400 text-xs font-bold">
                OVERDUE
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}