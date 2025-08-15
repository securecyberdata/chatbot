const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-password');
    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res) => {
  try {
    const { firstName, lastName, preferences } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { firstName, lastName, preferences },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/user/api-keys
// @desc    Update API keys
// @access  Private
router.put('/api-keys', async (req, res) => {
  try {
    const { apiKeys } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      { apiKeys },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({ user });
  } catch (error) {
    console.error('Update API keys error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
