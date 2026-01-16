const jwt = require("jsonwebtoken");
console.log("🔥 AUTH MIDDLEWARE LOADED");

/**
 * AUTH MIDDLEWARE
 * Expects: Authorization: Bearer <token>
 * Guarantees: req.user.id is always available
 */
const auth = (req, res, next) => {
  console.log("🔥 AUTH MIDDLEWARE EXECUTED");

  try {
    const authHeader = req.headers.authorization;

    // 1. Check header exists
    if (!authHeader) {
      return res.status(401).json({ msg: "No token, authorization denied" });
    }

    // 2. Validate Bearer format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return res.status(401).json({ msg: "Token format invalid" });
    }

    const token = parts[1];

    // 3. Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("🔥 JWT DECODED PAYLOAD:", decoded);


    // 4. NORMALIZE USER OBJECT (🔥 CRITICAL FIX 🔥)
    req.user = {
      id: decoded.id || decoded.userId
    };

    if (!req.user.id) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

/**
 * ROLE-BASED AUTHORIZATION (unchanged)
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ msg: "Access denied" });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `Role ${req.user.role} is not allowed`
      });
    }

    next();
  };
};

module.exports = { auth, authorize };
