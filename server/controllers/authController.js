const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const crypto = require("crypto");
const { sendPasswordResetEmail } = require("../services/mailService");

/**
 * REGISTER
 */
exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const existing = await User.findOne({ where: { email } });
  if (existing) {
    return res.status(400).json({ msg: 'User already exists' });
  }

  const user = await User.create({ name, email, password });

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(201).json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};

/**
 * LOGIN  ✅ FIXED FOREVER
 */
exports.login = async (req, res) => {
  const { email, password } = req.body;

  // 🔥 IMPORTANT PART
  const user = await User.scope(null).findOne({
    where: { email },
    attributes: ['id', 'name', 'email', 'role', 'password']
  });

  if (!user) {
    return res.status(401).json({ msg: 'Invalid email or password' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ msg: 'Invalid email or password' });
  }

  const token = jwt.sign(
    { userId: user.id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        msg: "Email is required"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.scope(null).findOne({
      where: { email: normalizedEmail }
    });

    // Do not reveal whether the email exists.
    if (!user) {
      return res.json({
        msg: "If an account with that email exists, a password reset link has been sent."
      });
    }

    // Generate a random one-time token.
    const rawToken = crypto.randomBytes(32).toString("hex");

    // Store only a SHA-256 hash in the database.
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    user.reset_password_token = hashedToken;
    user.reset_password_expires = expiresAt;

    await user.save();

    await sendPasswordResetEmail(user.email, rawToken);

    return res.json({
      msg: "If an account with that email exists, a password reset link has been sent."
    });

  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);

    return res.status(500).json({
      msg: "Unable to process password reset request"
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        msg: "Token and new password are required"
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        msg: "Password must be at least 6 characters long"
      });
    }

    // Hash the token received from the reset link.
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    const user = await User.scope(null).findOne({
      where: {
        reset_password_token: hashedToken
      }
    });

    if (!user) {
      return res.status(400).json({
        msg: "Invalid or expired password reset link"
      });
    }

    if (
      !user.reset_password_expires ||
      user.reset_password_expires <= new Date()
    ) {
      // Clean up expired token.
      user.reset_password_token = null;
      user.reset_password_expires = null;
      await user.save();

      return res.status(400).json({
        msg: "Invalid or expired password reset link"
      });
    }

    // Set the new password.
    user.password = password;

    // Invalidate the reset token immediately.
    user.reset_password_token = null;
    user.reset_password_expires = null;

    await user.save();

    return res.json({
      msg: "Password reset successful"
    });

  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);

    return res.status(500).json({
      msg: "Unable to reset password"
    });
  }
};
/**
 * GET CURRENT USER
 */
exports.getMe = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.userId, {
      attributes: ['id', 'name', 'email', 'role']
    });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ msg: 'Server error' });
  }
};
