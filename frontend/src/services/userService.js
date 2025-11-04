import API from "../api/axiosInstance";


const API_URL = "/users";


API.interceptors.response.use((response) => response,(error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
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


export const register = (form) => {
   delete API.defaults.headers.common["Authorization"];
  return API
    .post(`${API_URL}/register`, form)
    .then((res) => res.data);
};


export const login = async (email, password) => {
 
  delete API.defaults.headers.common["Authorization"];
  const res = await API.post(`${API_URL}/login`, { email, password });

  const { user, token } = res.data;

  localStorage.setItem( "user",JSON.stringify({...user,token }) );
  return res.data;
};



export const Forgotpassword = (email) => {
  return API
    .post(`${API_URL}/forgot-password`, { email })
    .then((res) => res.data);
};

export const Resetpassword = (token, password) => {
  return API
    .post(`${API_URL}/reset-password/${token}`, { password })
    .then((res) => res.data);
};


export const getMe = () => {
  return API.get(`${API_URL}/me`).then((res) => res.data);
};