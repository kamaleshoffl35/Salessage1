const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getUserById,
  getMe,
  updateUser,
  listUsers,
  forgotPassword,
  resetPassword,
} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");

// ---------------- PUBLIC ROUTES ----------------
router.post("/signup", register); // 👈 Public registration route
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// ---------------- PROTECTED ROUTES ----------------
router.post("/register", protect, authorize("super_admin"), register); // 👈 Admin-only route
router.get("/me", protect, getMe);
router.get("/", protect, authorize("super_admin", "admin"), listUsers);
router.get("/:id", protect, authorize("super_admin", "admin"), getUserById);
router.put("/:id", protect, authorize("super_admin", "admin"), updateUser);

module.exports = router;
