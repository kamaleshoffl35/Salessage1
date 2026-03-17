const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// ================= TOKEN =================

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
      tenant: user.tenant || null,
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ================= CHECK SUPER ADMIN =================

exports.checkSuperAdminExists = async (req, res) => {
  try {
    const superAdminCount = await User.countDocuments({ role: "super_admin" });
    res.json({ superAdminExists: superAdminCount > 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};



exports.register = async (req, res) => {
  try {
    const { name, email, password, phone, role, avatar, address } = req.body;
    const tenant = req.headers["x-tenant-id"] || null;

    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password required" });

    const emailNormalized = email.trim().toLowerCase();

    let user;

    if (role === "admin" || role === "super_admin") {
      const exists = await User.findOne({ email: emailNormalized });
      if (exists)
        return res.status(400).json({ error: "Email already in use" });

      user = new User({
        name,
        email: emailNormalized,
        password,
        phone,
        role,
        avatar,
        address,
        tenant: null,
      });
    } else {
      if (!tenant)
        return res.status(400).json({ error: "Tenant header required" });

      const exists = await User.findOne({ email: emailNormalized, tenant });
      if (exists)
        return res
          .status(400)
          .json({ error: "Email already registered for this website" });

      user = new User({
        name,
        email: emailNormalized,
        password,
        phone,
        role: "user",
        avatar,
        address,
        tenant,
      });
    }

    await user.save();

    const token = generateToken(user);

    // 🔥 SET COOKIE HERE
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: none,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/", 
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LOGIN =================

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const tenant = req.headers["x-tenant-id"] || null;

    if (!email || !password)
      return res.status(400).json({ error: "Email and password required" });

    const emailNormalized = email.trim().toLowerCase();

    let user;

    if (tenant) {
      user = await User.findOne({ email: emailNormalized, tenant });
    } else {
      user = await User.findOne({ email: emailNormalized, tenant: null });
    }

    if (!user)
      return res.status(400).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ error: "Invalid credentials" });

    const token = generateToken(user);

    // SET COOKIE ONLY
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: none,
    maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/", 
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
// ================= GET USER BY ID =================

exports.getUserById = async (req, res) => {
  try {
    const id = req.params.id;
    const u = await User.findById(id).select("-password");
    if (!u)
      return res.status(404).json({ error: "User not found" });

    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= GET ME =================

exports.getMe = async (req, res) => {
  try {
    if (!req.user)
      return res.status(401).json({ error: "Not authorized" });

    const u = await User.findById(req.user._id).select("-password");
    if (!u)
      return res.status(404).json({ error: "User not found" });

    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= UPDATE USER =================

exports.updateUser = async (req, res) => {
  try {
    const id = req.params.id;
    const update = { ...req.body };

    if (update.password) {
      const salt = await bcrypt.genSalt(10);
      update.password = await bcrypt.hash(update.password, salt);
    }

    const user = await User.findByIdAndUpdate(id, update, {
      new: true,
    }).select("-password");

    if (!user)
      return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= LIST USERS =================

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ================= FORGOT PASSWORD =================

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email)
      return res.status(400).json({ error: "Email required" });

    const emailNormalized = email.trim().toLowerCase();

    const user = await User.findOne({ email: emailNormalized });

    const successMessage = {
      message: "If this email exists, a password reset link has been sent.",
    };

    if (!user)
      return res.json(successMessage);

    const token = crypto.randomBytes(32).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Salesage" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset.</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link expires in 1 hour.</p>
      `,
    });

    res.json(successMessage);

  } catch (err) {
    res.json({
      message: "If this email exists, a password reset link has been sent.",
    });
  }
};

// ================= RESET PASSWORD =================

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    if (!password)
      return res.status(400).json({ error: "Password is required" });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ error: "Invalid or expired token" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successfully" });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// ================= LOGOUT =================

exports.logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({ message: "Logged out" });
};