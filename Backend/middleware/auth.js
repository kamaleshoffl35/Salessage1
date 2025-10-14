

const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  try {

    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "Not authorized, token missing" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid token" });
    }
    req.user = decoded; 
    const userInDB = await User.findById(decoded.id);
    if (!userInDB) {
      return res.status(401).json({ error: "User not found" });
    }
    req.user.role = req.user.role || userInDB.role;

    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ error: "Not authorized" });
  }
};


const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authorized" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Forbidden: Insufficient role" });
    }

    next();
  };
};


module.exports = { protect, authorize };
