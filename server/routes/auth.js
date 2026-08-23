const express = require('express');
const router = express.Router();

const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword
} = require('../controllers/authController');

const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', auth, getMe);   //not used

module.exports = router;
