import axios from "axios";

// Use the environment variable to set the baseURL dynamically
const apiRequest = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + "/api", // this ensures it's dynamic
  withCredentials: true,
});

export default apiRequest;
