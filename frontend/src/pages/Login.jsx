import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../services/userService";
import logo from "../assets/Logo.png";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import { useLocation } from "react-router-dom";
const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const successMessage = location.state?.message;

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });
  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   setError("");
  //   try {
  //     await login(form.email.trim(), form.password.trim());
  //     navigate("/");
  //   } catch (err) {
  //     setError(err.response?.data?.error || err.message);
  //   }
  // };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  try {
    await login(form.email.trim(), form.password.trim());

    // 🔥 CHECK SETUP EXISTS
    const setup = await API.get("/setup");

    if (!setup.data) {
      navigate("/setup");   // first time
    } else {
      navigate("/");        // already completed
    }

  } catch (err) {
    setError(err.response?.data?.error || err.message);
  }
};
  return (
    <div className="d-flex justify-content-center align-items-center vh-100"
      style={{ backgroundColor: "#c2cdd8ff" }}
    >
      <form className="card p-4 text-center" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
        <img src={logo} alt="Logo" style={{ width: "80px", height: "50px", margin: "0 auto 10px" }} />
        <h4 className="mb-3">SIGN IN</h4>
        {successMessage && (<div className="alert alert-success">{successMessage}</div>)}
        {error && <div className="alert alert-danger">{error}</div>}
        <div className="mb-2 text-start">
          <label className="form-label">Email <span className="text-danger">*</span></label>
          <input
            className="form-control bg-light"
            name="email"
            value={form.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="mb-3 text-start position-relative">
          <label className="form-label">
            Password <span className="text-danger">*</span>
          </label>

          <input
            className="form-control bg-light"
            type={showPassword ? "text" : "password"}
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{ paddingRight: "40px" }}
            required
          />

          <span
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: "absolute",
              right: "15px",
              top: "35px",
              cursor: "pointer",
              fontSize: "20px",
              color: "#888",
            }}
          >
            {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
          </span>
        </div>

        <button className="btn btn-primary w-100">Login</button>

        <p className="mt-3 mb-0">
          Don’t have an account?{" "}
          <Link to="/register" className="text-decoration-none text-primary">
            Sign up
          </Link>
        </p>

        <p className="mt-3 mb-0">
          <Link to="/forgot-password" className="text-decoration-none text-primary">
            Forgot Password?
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;


