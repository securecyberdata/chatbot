const express = require('express');
const Campaign = require('../models/Campaign');
const router = express.Router();

// @route   GET /api/campaigns
// @desc    Get all campaigns for user
// @access  Private
router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json({ campaigns });
  } catch (error) {
    console.error('Get campaigns error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /api/campaigns
// @desc    Create new campaign
// @access  Private
router.post('/', async (req, res) => {
  try {
    const { name, description, prompt, category, settings, metadata } = req.body;
    
    const campaign = new Campaign({
      name,
      description,
      prompt,
      category,
      settings,
      metadata,
      user: req.user.userId
    });

    await campaign.save();
    res.status(201).json({ campaign });
  } catch (error) {
    console.error('Create campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   PUT /api/campaigns/:id
// @desc    Update campaign
// @access  Private
router.put('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ campaign });
  } catch (error) {
    console.error('Update campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   DELETE /api/campaigns/:id
// @desc    Delete campaign
// @access  Private
router.delete('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId
    });

    if (!campaign) {
      return res.status(404).json({ error: 'Campaign not found' });
    }

    res.json({ message: 'Campaign deleted successfully' });
  } catch (error) {
    console.error('Delete campaign error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
