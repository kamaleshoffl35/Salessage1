import axios from "axios";


const API_URL = "http://localhost:5000/api/users";


axios.interceptors.response.use((response) => response,(error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const setUserHeader = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};
export const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common["Authorization"];
  }
};


export const register = (form) => {
   delete axios.defaults.headers.common["Authorization"];
  return axios
    .post(`${API_URL}/register`, form)
    .then((res) => res.data);
};


export const login = async (email, password) => {
 
  delete axios.defaults.headers.common["Authorization"];
  const res = await axios.post(`${API_URL}/login`, { email, password });

  const { user, token } = res.data;

  localStorage.setItem( "user",JSON.stringify({...user,token }) );
  return res.data;
};



export const Forgotpassword = (email) => {
  return axios
    .post(`${API_URL}/forgot-password`, { email })
    .then((res) => res.data);
};

export const Resetpassword = (token, password) => {
  return axios
    .post(`${API_URL}/reset-password/${token}`, { password })
    .then((res) => res.data);
};


export const getMe = () => {
  return axios.get(`${API_URL}/me`).then((res) => res.data);
};