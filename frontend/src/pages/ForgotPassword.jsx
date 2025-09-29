// import React, { useState } from "react";
// import { Link } from "react-router-dom";
// import axios from "axios";
// import { Forgotpassword } from "../services/userService";

// const ForgotPassword = () => {
//   const [email,setEmail]=useState("");
//   const [message,setMessage]=useState("");
//   const [error, setError]=useState("");

//   const handleSubmit = async (e) => {
//   e.preventDefault();
//   setMessage("");
//   setError("");
//   console.log("Submitting email:", email); // ✅ debug
//   try {
//     const res = await Forgotpassword(email);
//     console.log("Response:", res);
//     setMessage("Password reset link sent to your email.");
//   } catch (err) {
//     console.error("Error:", err.response || err.message);
//     setError(err.response?.data?.error || "Something went wrong");
//   }
// };


//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#c2cdd8ff" }}>
//       <form className="card p-4 text-center" style={{minWidth:320}} onSubmit={handleSubmit}>
//         <h4 className="mb-3">Forgot Password</h4>
//          {message && <div className="alert alert-success">{message}</div>}
//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mb-3 text-start">
//           <label className="form-label">Email <span className="text-danger">*</span></label>
//           <input  className="form-control bg-light" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required/>
//         </div>
//        <button className="btn btn-primary w-100" type="submit">Send Reset Link</button>
// <p className="mt-3 mb-0">
//     Remember your password?{" "}
//           <Link to="/login" className="text-decoration-none text-primary">Sign in</Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default ForgotPassword;
   


// src/components/ForgotPasswordForm.js
import { useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import { Container, Form, Button, Alert, Card } from "react-bootstrap";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const frontendUrl = window.location.origin;
      await axiosInstance.post("/api/auth/forgot-password", { email, frontendUrl });
      setMessage("Reset link sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Error sending reset link");
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <Card style={{ width: "100%", maxWidth: "400px", padding: "20px" }}>
        <Card.Body>
          <h5 className="text-center mb-3">Forgot Password</h5>
          <p className="text-center text-muted mb-3">
            Enter your registered email address. We'll send you a link to reset your password.
          </p>

          {message && <Alert variant="success">{message}</Alert>}
          {error && <Alert variant="danger">{error}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>

            <Button type="submit" variant="primary" className="w-100">
              Send Reset Link
            </Button>
          </Form>

          <div className="text-center mt-3">
            <Link to="/login">Back to Login</Link>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
