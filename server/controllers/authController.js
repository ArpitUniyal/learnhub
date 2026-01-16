const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

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
