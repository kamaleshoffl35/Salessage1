import axios from "axios";


const API_URL = "http://localhost:5000/api/users";




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
    .post(`${API_URL}/signup`, form)
    .then((res) => res.data);
};


export const login = async (email, password) => {
  // clear any old token
  delete axios.defaults.headers.common["Authorization"];

  // send login request
  const res = await axios.post(`${API_URL}/login`, { email, password });

  const { user, token } = res.data;

  // ✅ Save BOTH user and token to localStorage
  localStorage.setItem(
    "user",
    JSON.stringify({
      ...user,
      token,
    })
  );

  // ✅ Set default header for all axios requests
  

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