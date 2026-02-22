const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/trending - Items tendance
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;

    const trending = await Item.find()
      .sort({ views: -1, likes: -1 })
      .limit(limit)
      .select('itemName itemID views likes type authorName');

    res.json({
      success: true,
      trending,
      count: trending.length
    });
  } catch (error) {
    console.error('Error in GET /trending:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch trending items' 
    });
  }
});

module.exports = router;
