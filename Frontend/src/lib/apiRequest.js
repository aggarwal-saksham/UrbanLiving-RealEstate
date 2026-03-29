import axios from "axios";

// Trim any trailing slash so we do not accidentally end up with double `/api`.
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:8800";

const apiRequest = axios.create({
  baseURL: `${apiBaseUrl}/api`,
  withCredentials: true,
});

export default apiRequest;
