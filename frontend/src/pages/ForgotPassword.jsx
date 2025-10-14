import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { Forgotpassword } from "../services/userService";

const ForgotPassword = () => {
  const [email,setEmail]=useState("");
  const [message,setMessage]=useState("");
  const [error, setError]=useState("");

  const handleSubmit = async (e) => {
  e.preventDefault();
  setMessage("");
  setError("");
  console.log("Submitting email:", email); 
  try {
    const res = await Forgotpassword(email);
    console.log("Response:", res);
    setMessage("Password reset link sent to your email.");
  } catch (err) {
    console.error("Error:", err.response || err.message);
    setError(err.response?.data?.error || "Something went wrong");
  }
};


  return (
    <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#c2cdd8ff" }}>
      <form className="card p-4 text-center" style={{minWidth:320}} onSubmit={handleSubmit}>
        <h4 className="mb-3">Forgot Password</h4>
         {message && <div className="alert alert-success">{message}</div>}
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="mb-3 text-start">
          <label className="form-label">Email <span className="text-danger">*</span></label>
          <input  className="form-control bg-light" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
        </div>
       <button className="btn btn-primary w-100" type="submit">Send Reset Link</button>
<p className="mt-3 mb-0">
    Remember your password?{" "}
          <Link to="/login" className="text-decoration-none text-primary">Sign in</Link>
        </p>
      </form>
    </div>
  );
};

export default ForgotPassword;
   


