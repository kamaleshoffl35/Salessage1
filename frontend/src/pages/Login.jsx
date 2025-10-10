// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { login, setUserHeader } from "../services/userService";
// import axios from "axios";

// const Login = () => {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//  const handleSubmit = async (e) => {
//   e.preventDefault();
//   setError("");
//   try {
//     const { user, token } = await login(form.email.trim(), form.password.trim());

//     // store token & user
//     localStorage.setItem("user", JSON.stringify(user));
//     localStorage.setItem("token", token);

//     // set default axios header for future requests
//     axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

//     navigate("/");
//   } catch (err) {
//     setError(err.response?.data?.error || err.message);
//   }
// };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100" style={{
//       backgroundSize: "200px",
//       backgroundColor: "#c2cdd8ff",
//       backgroundAttachment: "fixed",
//     }}>
//       <form className="card p-4 text-center" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
//         <img src="/src/assets/Logo.png" alt="Logo" style={{ width: "80px", height: "50px", margin: "0 auto 10px" }} />
//         <h4 className="mb-3">SIGN IN</h4>
//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mb-2 text-start">
//           <label className="form-label">Email<span className="text-danger">*</span></label>
//           <input className="form-control bg-light" name="email" value={form.email} onChange={handleChange} />
//         </div>

//         <div className="mb-3 text-start">
//           <label className="form-label">Password<span className="text-danger">*</span></label>
//           <input className="form-control bg-light" type="password" name="password" value={form.password} onChange={handleChange} />
//         </div>

//         <button className="btn btn-primary w-100">Login</button>

//         <p className="mt-3 mb-0">
//           Don’t have an account?{" "}
//           <Link to="/register" className="text-decoration-none text-primary">
//             Sign up
//           </Link>
//         </p>
//         <p className="mt-3 mb-0">
//           <Link to="/forgot-password" className="text-decoration-none text-primary">
//             Forgot Password?
//           </Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default Login;


import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/userService";
import axios from "axios";

const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const { user, token } = await login(form.email.trim(), form.password.trim());

    // ✅ Store user + token in one object
    localStorage.setItem("user", JSON.stringify({ ...user, token }));

    // ✅ Set axios default header
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    // Redirect based on role
    switch (user.role) {
      case "super_admin":
      case "admin":
      case "user":
        navigate("/");
        break;
      default:
        navigate("/");
    }
  } catch (err) {
    setError(err.response?.data?.error || err.message);
  }
};


  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{
        backgroundSize: "200px",
        backgroundColor: "#c2cdd8ff",
        backgroundAttachment: "fixed",
      }}
    >
      <form
        className="card p-4 text-center"
        style={{ minWidth: 320 }}
        onSubmit={handleSubmit}
      >
        <img
          src="/src/assets/Logo.png"
          alt="Logo"
          style={{ width: "80px", height: "50px", margin: "0 auto 10px" }}
        />
        <h4 className="mb-3">SIGN IN</h4>
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-2 text-start">
          <label className="form-label">
            Email<span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3 text-start">
          <label className="form-label">
            Password<span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
          />
        </div>

        <button className="btn btn-primary w-100">Login</button>

        <p className="mt-3 mb-0">
          Don’t have an account?{" "}
          <Link to="/register" className="text-decoration-none text-primary">
            Sign up
          </Link>
        </p>
        <p className="mt-3 mb-0">
          <Link
            to="/forgot-password"
            className="text-decoration-none text-primary"
          >
            Forgot Password?
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;




