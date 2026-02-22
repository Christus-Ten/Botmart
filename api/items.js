const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/items - Liste paginée des items
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const type = req.query.type || '';
    const sort = req.query.sort || '-createdAt';

    const query = {};
    
    // Recherche textuelle
    if (search) {
      query.$text = { $search: search };
    }
    
    // Filtre par type
    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;
    
    const items = await Item.find(query)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .select('-code -__v');

    const total = await Item.countDocuments(query);

    res.json({
      success: true,
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      limit
    });
  } catch (error) {
    console.error('Error in GET /items:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch items' 
    });
  }
});

// POST /api/items/:id/like - Liker un item
router.post('/:id/like', async (req, res) => {
  try {
    const item = await Item.findOne({ itemID: req.params.id });
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }

    item.likes += 1;
    await item.save();

    res.json({
      success: true,
      likes: item.likes
    });
  } catch (error) {
    console.error('Error in POST /items/:id/like:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to like item' 
    });
  }
});

module.exports = router;
