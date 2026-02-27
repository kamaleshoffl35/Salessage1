
import axios from "axios";

const API = axios.create({
 baseURL: "https://vyoobam-bix-backend.onrender.com/api",
// baseURL: "http://localhost:5000/api",
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
});


API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
