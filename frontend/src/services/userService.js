import API from "../api/axiosInstance";

const API_URL = "/users";
API.interceptors.response.use(
  (response) => response,
  (error) => {
  
    const url = error.config?.url || '';
    const isPublicRoute = 
      url.includes('check-super-admin') || 
      url.includes('register') || 
      url.includes('login') ||
      url.includes('forgot-password') ||
      url.includes('reset-password');
    
    if (error.response?.status === 401 && !isPublicRoute) {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const setUserHeader = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};

export const checkSuperAdminExists = () => {
  const publicAPI = API.create();
  delete publicAPI.defaults.headers.common["Authorization"];
  
  return publicAPI.get(`${API_URL}/check-super-admin`)
    .then((res) => {
      console.log("Super admin check response:", res.data);
      return res.data;
    })
    .catch((error) => {
      console.error("Error in checkSuperAdminExists:", error);
      return { superAdminExists: true };
    });
};

export const register = (form) => {
  const publicAPI = API.create();
  delete publicAPI.defaults.headers.common["Authorization"];
  
  return publicAPI.post(`${API_URL}/register`, form)
    .then((res) => res.data)
    .catch((error) => {
      console.error("Registration error:", error);
      throw error;
    });
};


export const login = async (email, password) => {
  const publicAPI = API.create();
  delete publicAPI.defaults.headers.common["Authorization"];
  
  const res = await publicAPI.post(`${API_URL}/login`, { email, password });
  const { user, token } = res.data;
  localStorage.setItem("user", JSON.stringify({ ...user, token }));
  localStorage.setItem("token", token);
  return res.data;
};

export const Forgotpassword = (email) => {
  const publicAPI = API.create();
  delete publicAPI.defaults.headers.common["Authorization"];
  
  return publicAPI.post(`${API_URL}/forgot-password`, { email })
    .then((res) => res.data);
};

export const Resetpassword = (token, password) => {
  const publicAPI = API.create();
  delete publicAPI.defaults.headers.common["Authorization"];
  
  return publicAPI.post(`${API_URL}/reset-password/${token}`, { password })
    .then((res) => res.data);
};

export const getMe = () => {
  return API.get(`${API_URL}/me`).then((res) => res.data);
};