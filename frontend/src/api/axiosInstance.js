
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api",
 // baseURL: "https://salessage.onrender.com/api",
//baseURL: "http://localhost:5000/api",
//  baseURL: "https://vyoobam-bix-backend.onrender.com/api",
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
