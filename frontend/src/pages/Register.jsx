// // src/pages/Register.jsx
// import React, { useState } from "react";
// import { useNavigate,Link } from "react-router-dom";
// import { register, setUserHeader } from "../services/userService";
// const Register=()=>{
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role:"",
//     phone: "",
//     avatar: "",
//     address: "",
//   });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const user = await register(form);
//       localStorage.setItem("user", JSON.stringify(user));
//       localStorage.setItem("userId", user._id);
//       setUserHeader(user._id);
//       navigate("/"); // redirect to dashboard after registration
//     } catch (err) {
//       setError(err.response?.data?.error || err.message);
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100 " style={{ backgroundColor: "#c2cdd8ff",}}>
//       <form className="card p-4" style={{ minWidth: 520 }} onSubmit={handleSubmit}>
//         <h4 className="mb-3 text-center">REGISTER</h4>
//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mb-2">
//           <label className="form-label">Name<span className="text-danger">*</span></label>
//           <input
//             className="form-control bg-light"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-2">
//           <label className="form-label">Email<span className="text-danger">*</span></label>
//           <input
//             className="form-control bg-light"
//             name="email"
//             type="email"
//             value={form.email}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-2">
//           <label className="form-label">Password<span className="text-danger">*</span></label>
//           <input
//             className="form-control bg-light"
//             name="password"
//             type="password"
//             value={form.password}
//             onChange={handleChange}
//             required
//           />
//         </div>

//         <div className="mb-2">
//           <label className="form-label">Phone<span className="text-danger">*</span></label>
//           <input
//             className="form-control bg-light"
//             name="phone"
//             value={form.phone}
//             onChange={handleChange}
//           />
//         </div>
//         <div className="mb-2">
//           <label className="form-label">Role<span className="text-danger">*</span></label>
//           <input
//             className="form-control bg-light" 
//             name="role"
//             value={form.role}
//             onChange={handleChange}
//           />
//         </div>

       

//         <div className="mb-2">
//           <label className="form-label">Address<span className="text-danger">*</span></label>
//           <input
//             className="form-control bg-light" 
//             name="address"
//             value={form.address}
//             onChange={handleChange}
//           />
//         </div>

//         <button className="btn btn-primary w-100">Register</button>
//          <p className="mt-3 mb-0 ">
//                 Do you have an account?{" "}

//                 <Link to="/login" className="text-decoration-none text-primary " style={{marginLeft:"235px"}}>
//                   Sign in
//                 </Link>
//               </p>
//       </form>
     
//     </div>
//   );
// }
// export default Register


// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register, setAuthToken } from "../services/userService";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    avatar: "",
    address: "",
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      // Call register service
      const { user, token } = await register(form);

      // Save token and user info in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Set auth token for future API calls
      setAuthToken(token);

      // Redirect to dashboard
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  return (
    <div
      className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#c2cdd8ff" }}
    >
      <form
        className="card p-4"
        style={{ minWidth: 400 }}
        onSubmit={handleSubmit}
      >
        <h4 className="mb-3 text-center">REGISTER</h4>
        {error && <div className="alert alert-danger">{error}</div>}
   <div className="d-flex justify-content-between mb-3 ">
  <div class="form-check ">
  
  <label class="form-check-label" for="super_admin">
    Super Admin
  </label>
  <input
    class="form-check-input"
    type="radio"
    name="role"
    id="super_admin"
    value={form.role}
  />
  
</div>

<div class="form-check ">
  
  <label class="form-check-label" for="admin">
    Admin
  </label>
  <input
    class="form-check-input"
    type="radio"
    name="role"
    id="admin"
    value={form.role}
  />
  
</div>
<div class="form-check ">
  
  <label class="form-check-label" for="user">
   Entry User
  </label>
  <input
    class="form-check-input"
    type="radio"
    name="role"
    id="user"
    value={form.role}
  />
  </div>
  </div>

        <div className="mb-2">
          <label className="form-label">
            Name <span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label className="form-label">
            Email <span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label className="form-label">
            Password <span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-2">
          <label className="form-label">
            Phone <span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        {/* <div className="mb-2">
          <label className="form-label">
            Role <span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="role"
            value={form.role}
            onChange={handleChange}
          />
        </div> */}
    
        <div className="mb-2">
          <label className="form-label">
            Address <span className="text-danger">*</span>
          </label>
          <input
            className="form-control bg-light"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100">Register</button>

        <p className="mt-3 mb-0 text-center">
          Already have an account?{" "}
          <Link to="/login" className="text-decoration-none text-primary">
            Sign in
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
