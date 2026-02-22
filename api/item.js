const express = require('express');
const router = express.Router();
const path = require('path');
const Item = require(path.join(__dirname, '..', 'models', 'Item'));

// GET /api/item/:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ itemID: req.params.id });
    
    if (!item) {
      return res.status(404).json({ success: false, error: 'Item not found' });
    }

    await item.incrementViews();

    const itemData = item.toObject();
    delete itemData.code;
    delete itemData.__v;

    res.json(itemData);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
