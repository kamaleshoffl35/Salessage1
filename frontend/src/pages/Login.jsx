// import React, { useState } from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { login, setUserHeader } from "../services/userService";

// const Login = () => {
//   const [form, setForm] = useState({
//     email: "",
//     password: "",
//   });
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleChange = (e) =>
//     setForm({ ...form, [e.target.name]: e.target.value });

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     try {
//       const user = await login(form.email.trim(), form.password.trim());

//       localStorage.setItem("user", JSON.stringify(user));
//       localStorage.setItem("userId", user._id);
//       setUserHeader(user._id);
//       navigate("/");
//     } catch (err) {
//       setError(err.response?.data?.error || err.message);
//     }
//   };

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



// src/components/LoginForm.js
import { useState } from "react";
import { useDispatch } from "react-redux";
import { loginUser } from "../redux/authSlice";
import { Link } from "react-router-dom";
import {
  Form,
  Button,
  Container,
  Spinner,
  InputGroup,
  FormControl,
  Alert,
} from "react-bootstrap";

const Login = () => {
  const dispatch = useDispatch();
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const result = await dispatch(loginUser(credentials)).unwrap();
      if (result.token) sessionStorage.setItem("token", result.token);
      if (result.refreshToken) sessionStorage.setItem("refreshToken", result.refreshToken);
    } catch (err) {
      const backendMsg =
        err?.message ||
        err?.error ||
        (typeof err === "string" ? err : "Login failed. Please check your credentials.");
      setError(backendMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <h3 className="text-center mb-4">Login</h3>
        {error && <Alert variant="danger">{error}</Alert>}
        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3" controlId="username">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              required
              autoFocus
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>Password</Form.Label>
            <InputGroup>
              <FormControl
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                name="password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? "Hide" : "Show"}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button type="submit" variant="primary" className="w-100" disabled={loading}>
            {loading ? <Spinner animation="border" size="sm" /> : "Login"}
          </Button>

          <div className="text-end mt-2">
            <Link to="/forgot-password">Forgot Password?</Link>
          </div>
        </Form>
      </div>
    </Container>
  );
};

export default Login;

