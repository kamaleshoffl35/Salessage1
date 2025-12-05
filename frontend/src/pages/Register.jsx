import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {register,setAuthToken,checkSuperAdminExists,} from "../services/userService";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    phone: "",
    avatar: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [superAdminExists, setSuperAdminExists] = useState(true);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSuperAdmin = async () => {
      try {
        console.log("Starting super admin check...");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        const result = await checkSuperAdminExists();
        console.log("Super admin check completed:", result);
        setSuperAdminExists(result.superAdminExists);
        setError("");
      } catch (err) {
        console.error("Error in super admin check:", err);
        setSuperAdminExists(true);
        setError("System check completed. You can register as Admin or User.");
      } finally {
        setLoading(false);
      }
    };
    checkSuperAdmin();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (superAdminExists && form.role === "super_admin") {
      setError("Super admin already exists in the system");
      return;
    }
    if (!form.name || !form.email || !form.password) {
      setError("Name, email and password are required");
      return;
    }
    try {
      const { user, token } = await register(form);
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setAuthToken(token);
      navigate("/");
    } catch (err) {
      console.error("Registration error:", err);
      setError(
        err.response?.data?.error || err.message || "Registration failed"
      );
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center vh-100"
        style={{ backgroundColor: "#c2cdd8ff" }}
      >
        <div className="card p-4 text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Checking system status...</p>
        </div>
      </div>
    );
  }
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
        {error && (
          <div
            className={`alert ${
              error.includes("System check completed")
                ? "alert-info"
                : "alert-danger"
            }`}
          >
            {error}
          </div>
        )}

        <div className="d-flex justify-content-between mb-3 flex-wrap">
          {!superAdminExists && (
            <div className="form-check mb-2">
              <input
                className="form-check-input"
                type="radio"
                name="role"
                id="super_admin"
                value="super_admin"
                checked={form.role === "super_admin"}
                onChange={handleChange}
              />
              <label className="form-check-label" htmlFor="super_admin">
                Super Admin
              </label>
            </div>
          )}

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              name="role"
              id="admin"
              value="admin"
              checked={form.role === "admin"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="admin">
              Admin
            </label>
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="radio"
              name="role"
              id="user"
              value="user"
              checked={form.role === "user"}
              onChange={handleChange}
            />
            <label className="form-check-label" htmlFor="user">
              User
            </label>
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

        <div className="mb-2 text-start position-relative">
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

        <div className="mb-2">
          <label className="form-label">Phone</label>
          <input
            className="form-control bg-light"
            name="phone"
            value={form.phone}
            onChange={handleChange}
          />
        </div>

        <div className="mb-2">
          <label className="form-label">Address</label>
          <input
            className="form-control bg-light"
            name="address"
            value={form.address}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary w-100 mt-3">
          Register
        </button>

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
