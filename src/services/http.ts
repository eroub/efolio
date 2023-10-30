// http.ts
import axios from "axios";

const port = process.env.REACT_APP_APIPORT || 3001;
const url = process.env.REACT_APP_APIURL || `http://localhost:${port}`;

const http = axios.create({
  baseURL: url,
  headers: {
    "Content-type": "application/json",
  },
});

// Add a request interceptor
http.interceptors.request.use(
  (config) => {
    // Get the token from local storage (or some other storage)
    const token = localStorage.getItem("authToken");
    // If token is present, set it in the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default http;
