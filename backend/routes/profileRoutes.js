const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const { updateProfileRules, validate } = require('../validators/profileValidator');

const router = express.Router();

router.use(auth);

router.get('/', async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (err) {
    next(err);
  }
});

router.put('/', ...updateProfileRules(), validate, async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (email !== undefined) {
      const existing = await User.findOne({ email, _id: { $ne: req.user._id } });
      if (existing) {
        return res.status(400).json({ success: false, message: 'Email already in use.' });
      }
      updates.email = email;
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
      runValidators: true,
    }).select('-password');
    res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
