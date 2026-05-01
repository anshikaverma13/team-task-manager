import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.team-task-manager-production-a620.up.railway.app/api
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = token;
  }
  return req;
});

export default API;