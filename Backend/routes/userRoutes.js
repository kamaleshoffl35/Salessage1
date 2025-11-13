const express = require("express");
const router = express.Router();
const {register,login,getUserById,getMe,updateUser,listUsers,forgotPassword,resetPassword,} = require("../controllers/userController");

const { protect, authorize } = require("../middleware/auth");

// router.post("/signup", register); 
router.post("/login", login);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// router.post("/register", protect, authorize("super_admin"), register); 
router.post("/register", register);
router.get("/me", protect, getMe);
router.get("/", protect, authorize("super_admin", "admin"), listUsers);
router.get("/:id", protect, authorize("super_admin", "admin"), getUserById);
router.put("/:id", protect, authorize("super_admin", "admin"), updateUser);

module.exports = router;
