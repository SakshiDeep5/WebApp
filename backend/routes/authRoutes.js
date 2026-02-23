const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { registerRules, loginRules, validate } = require('../validators/authValidator');

const router = express.Router();

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });

router.post('/register', ...registerRules(), validate, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already registered.' });
    }
    const user = await User.create({ name, email, password });
    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.status(201).json({
      success: true,
      message: 'User registered successfully.',
      token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', ...loginRules(), validate, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }
    const token = signToken(user._id);
    const userObj = user.toObject();
    delete userObj.password;
    res.json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: userObj,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
