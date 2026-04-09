import axios from "axios";
import { decrypt } from "./secure";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8888/",
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

api.interceptors.request.use(
  async (config) => {
    if (typeof window === "undefined") return config;

    const encrypted = localStorage.getItem("accessToken");
    if (encrypted) {
      const token = await decrypt(encrypted);
      if (token) {
        config.headers["Authorization"] = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
