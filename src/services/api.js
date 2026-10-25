
import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_BASE_URL ||
    "http://localhost:5001/api/v1"
});

// Attach the JWT token to requests automatically.
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Clear the session if the backend rejects an expired or invalid token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      sessionStorage.getItem("token")
    ) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("student");
      localStorage.removeItem("loggedInUser");
    }

    return Promise.reject(error);
  }
);

export default api;
