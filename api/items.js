const express = require('express');
const router = express.Router();
const path = require('path');
const Item = require(path.join(__dirname, '..', 'models', 'Item'));

// GET /api/items - Liste paginée
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type || '';

    const query = {};
    if (search) query.$text = { $search: search };
    if (type) query.type = type;

    const skip = (page - 1) * limit;
    
    const items = await Item.find(query)
      .sort('-createdAt')
      .skip(skip)
      .limit(limit)
      .select('-code -__v');

    const total = await Item.countDocuments(query);

    res.json({
      success: true,
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/items/:id/like
router.post('/:id/like', async (req, res) => {
  try {
    const item = await Item.findOne({ itemID: req.params.id });
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }
    item.likes += 1;
    await item.save();
    res.json({ success: true, likes: item.likes });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
