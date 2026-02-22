const express = require('express');
const router = express.Router();
const path = require('path');
const Item = require(path.join(__dirname, '..', 'models', 'Item'));

// GET /api/trending
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
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
