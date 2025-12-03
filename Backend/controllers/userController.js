const User = require("../models/User");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { protect, authorize } = require("../middleware/auth");

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
};

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

    if (!name || !email || !password)
      return res
        .status(400)
        .json({ error: "Name, email and password required" });

    const emailNormalized = email.trim().toLowerCase();
    const exists = await User.findOne({ email: emailNormalized });
    if (exists) return res.status(400).json({ error: "Email already in use" });

    // Check if super admin already exists and prevent creating another one
    if (role === "super_admin") {
      const superAdminExists = await User.findOne({ role: "super_admin" });
      if (superAdminExists) {
        return res.status(400).json({ error: "Super admin already exists" });
      }
    }

    const user = new User({
      name,
      email: emailNormalized,
      password,
      phone,
      role: role || "user",
      avatar,
      address,
    });

    await user.save();
    const token = generateToken(user);

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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
    const token = generateToken(user);

    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 300000,
      samesite: "lax",
      secure: false,
    });

    res.json({
      user: userObj,
      token,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

exports.getMe = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Not authorized" });
    const u = await User.findById(req.user._id).select("-password");
    if (!u) return res.status(404).json({ error: "User not found" });
    res.json(u);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

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

    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email required" });
    }

    const emailNormalized = email.trim().toLowerCase();
    const user = await User.findOne({ email: emailNormalized });

    const successMessage = {
      message: "If this email exists, a password reset link has been sent.",
    };

    if (!user) {
      return res.json(successMessage);
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${token}`;
    const mailOptions = {
      from: `"Billing App" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset Request",
      html: `
        <p>You requested a password reset. Click the link below:</p>
        <a href="${resetLink}">${resetLink}</a>
        <p>This link will expire in 1 hour.</p>
      `,
    };
    let transporter;
    try {
      transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      transporter.verify((err, success) => {
        if (err) {
          console.log("SMTP ERROR:", err);
        } else {
          console.log("SMTP OK:", success);
        }
      });
    } catch (err) {
      console.log("Transport creation error:", err.message);
    }
    if (transporter) {
      try {
        await transporter.sendMail(mailOptions);
        console.log("Email sent successfully to:", user.email);
      } catch (mailErr) {
        console.error("EMAIL SENDING FAILED:", mailErr);
      }
    }

    return res.json(successMessage);
  } catch (err) {
    console.error("Forgot password unexpected error:", err);
    return res.json({
      message: "If this email exists, a password reset link has been sent.",
    });
  }
};

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
    res.json({ message: "Password has been reset successfully" });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

