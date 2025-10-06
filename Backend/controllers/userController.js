const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");

// ---------------- REGISTER ----------------
exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, avatar, address } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password required" });

    const emailNormalized = email.trim().toLowerCase();
    const exists = await User.findOne({ email: emailNormalized });
    if (exists) return res.status(400).json({ error: "Email already in use" });

    // plain password here; pre-save hook will hash
    const user = new User({
      name,
      email: emailNormalized,
      password,
      phone,
      role,
      avatar,
      address,
    });

    await user.save();
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- LOGIN ----------------
// ---------------- LOGIN ----------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const emailNormalized = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: "Invalid credentials" });

    const userObj = user.toObject();
    delete userObj.password;

    // 🔹 Create a JWT token
    const jwt = require("jsonwebtoken");
    const token = jwt.sign(
      { id: user._id, email: user.email }, // payload
      process.env.JWT_SECRET,              // secret key
      { expiresIn: "1h" }                  // expiration
    );
   
    // send user info + token
    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ---------------- GET USER BY ID ----------------
exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const u = await User.findById(id).select("-password");
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- GET CURRENT USER ----------------
exports.getMe = async (req, res) => {
  try {
    const id = req.header("x-user-id") || req.query.userId;
    if (!id)
      return res.status(400).json({ error: "user id required in x-user-id header or ?userId=" });

    const u = await User.findById(id).select("-password");
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- UPDATE USER ----------------
exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const update = { ...req.body };

    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, update, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- LIST USERS ----------------
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ---------------- FORGOT PASSWORD ----------------
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email required" });

    const emailNormalized = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailNormalized });
    if (!user) return res.status(404).json({ error: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1h
    await user.save();

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const resetLink = `http://localhost:5173/reset-password/${token}`;

    await transporter.sendMail({
      from: `"Billing App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `<p>You requested a password reset. Click here:</p>
             <a href="${resetLink}">${resetLink}</a>
             <p>Expires in 1 hour.</p>`,
    });

    res.json({ message: "Password reset link sent to email" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// ---------------- RESET PASSWORD ----------------
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    // Assign plain password; pre-save hook will hash
    user.password = password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
