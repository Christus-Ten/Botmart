const express = require('express');
const router = express.Router();
const Item = require('../models/Item');

// GET /api/item/:id - Détails d'un item spécifique
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findOne({ itemID: req.params.id });
    
    if (!item) {
      return res.status(404).json({ 
        success: false, 
        error: 'Item not found' 
      });
    }

    // Incrémenter les vues
    await item.incrementViews();

    const itemData = item.toObject();
    delete itemData.code; // Ne pas envoyer le code dans cette route
    delete itemData.__v;

    res.json(itemData);
  } catch (error) {
    console.error('Error in GET /item/:id:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch item' 
    });
  }
});

module.exports = router;
