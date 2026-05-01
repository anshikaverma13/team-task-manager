import { useState } from "react";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
  try {
    const res = await API.post("/auth/login", { email, password });

    // ✅ store token
    localStorage.setItem("token", res.data.token);

    // 🔥 IMPORTANT: store user (role + id)
    localStorage.setItem("user", JSON.stringify(res.data.user));

    navigate("/dashboard");
  } catch {
    alert("Login failed");
  }
};

  return (
    <div className="h-screen flex items-center justify-center bg-dark text-white">
      <div className="bg-[#1a1a1a] p-8 rounded-2xl shadow-lg w-80">
        
        <h2 className="text-2xl font-bold mb-6 text-center text-primary">
          Ethara Task Manager
        </h2>

        <input
          className="w-full p-2 mb-3 rounded bg-[#2a2a2a]"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="w-full p-2 mb-4 rounded bg-[#2a2a2a]"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="w-full bg-primary py-2 rounded hover:opacity-80"
        >
          Login
        </button>
      </div>
    </div>
  );
}