// import React, { useState } from "react";
// import { useParams, Link, useNavigate } from "react-router-dom";
// import { Resetpassword } from "../services/userService";

// const ResetPassword = () => {
//   const { token } = useParams();
//   const [password, setPassword] = useState("");
//   const [confirmPassword, setConfirmPassword] = useState("");
//   const [message, setMessage] = useState("");
//   const [error, setError] = useState("");
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setMessage("");
//     setError("");

//     if (password !== confirmPassword) {
//       setError("Passwords do not match!");
//       return;
//     }

//     try {
//       await Resetpassword(token, password);
//       setMessage("Password has been reset successfully.");
//       setTimeout(() => navigate("/login"), 2000);
//     } catch (err) {
//       setError(err.response?.data?.error || "Something went wrong");
//     }
//   };

//   return (
//     <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "#c2cdd8ff" }}>
//       <form className="card p-4 text-center" style={{ minWidth: 320 }} onSubmit={handleSubmit}>
//         <h4 className="mb-3">Reset Password</h4>
//         {message && <div className="alert alert-success">{message}</div>}
//         {error && <div className="alert alert-danger">{error}</div>}

//         <div className="mb-3 text-start">
//           <label className="form-label">New Password</label>
//           <input type="password" className="form-control bg-light" value={password} onChange={(e) => setPassword(e.target.value)} required />
//         </div>

//         <div className="mb-3 text-start">
//           <label className="form-label">Confirm Password</label>
//           <input type="password" className="form-control bg-light" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
//         </div>

//         <button className="btn btn-primary w-100">Reset Password</button>

//         <p className="mt-3 mb-0">
//           Remembered? <Link to="/login" className="text-decoration-none text-primary">Sign in</Link>
//         </p>
//       </form>
//     </div>
//   );
// };

// export default ResetPassword;



// src/components/ResetPasswordForm.js
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  ListGroup,
} from "react-bootstrap";
import { CheckCircleFill, XCircleFill } from "react-bootstrap-icons"; // bootstrap icons

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const passwordRules = {
    minLength: password.length >= 6,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecialChar: /[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (
      !passwordRules.minLength ||
      !passwordRules.hasUppercase ||
      !passwordRules.hasLowercase ||
      !passwordRules.hasNumber ||
      !passwordRules.hasSpecialChar
    ) {
      setError("Password does not meet all requirements.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axiosInstance.post(`/api/auth/reset-password/${token}`, {
        newPassword: password,
      });
      setMessage("Password has been reset successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Token expired or invalid.");
    }
  };

  const renderChecklistItem = (condition, text) => (
    <ListGroup.Item className="d-flex align-items-center">
      {condition ? (
        <CheckCircleFill className="text-success me-2" />
      ) : (
        <XCircleFill className="text-danger me-2" />
      )}
      {text}
    </ListGroup.Item>
  );

  return (
    <Container
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: "100vh" }}
    >
      <Card style={{ width: "100%", maxWidth: "400px" }} className="p-3">
        <Card.Body>
          <h5 className="text-center mb-2">Reset Your Password</h5>
          <p className="text-center text-muted">
            Enter your new password below.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleReset}>
            <Form.Group className="mb-3" controlId="newPassword">
              <Form.Label>New Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoFocus
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="confirmPassword">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </Form.Group>

            <div className="border rounded mb-3 p-2">
              <small className="fw-bold d-block mb-1">
                Password must contain:
              </small>
              <ListGroup variant="flush">
                {renderChecklistItem(
                  passwordRules.minLength,
                  "At least 6 characters"
                )}
                {renderChecklistItem(
                  passwordRules.hasUppercase,
                  "An uppercase letter (A-Z)"
                )}
                {renderChecklistItem(
                  passwordRules.hasLowercase,
                  "A lowercase letter (a-z)"
                )}
                {renderChecklistItem(
                  passwordRules.hasNumber,
                  "A number (0-9)"
                )}
                {renderChecklistItem(
                  passwordRules.hasSpecialChar,
                  "A special character (!@#$...)"
                )}
              </ListGroup>
            </div>

            <Button type="submit" variant="primary" className="w-100">
              Reset Password
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
