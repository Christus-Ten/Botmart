const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// POST /v1/paste - Uploader un nouveau commande
router.post('/', async (req, res) => {
  try {
    const { itemName, description, type, code, authorName, authorID, tags } = req.body;

    // Validation
    if (!itemName || !code) {
      return res.status(400).json({ 
        success: false, 
        error: 'itemName and code are required' 
      });
    }

    // Générer un ID unique
    const lastItem = await Item.findOne().sort({ itemID: -1 });
    const itemID = (lastItem?.itemID || 0) + 1;
    
    const rawID = uuidv4();
    const fileName = `${rawID}.js`;
    const filePath = path.join(__dirname, '../public/raw', fileName);

    // Créer le dossier raw s'il n'existe pas
    if (!fs.existsSync(path.join(__dirname, '../public/raw'))) {
      fs.mkdirSync(path.join(__dirname, '../public/raw'), { recursive: true });
    }

    // Sauvegarder le code dans un fichier
    fs.writeFileSync(filePath, code);

    // Créer l'item dans la base de données
    const newItem = new Item({
      itemID,
      itemName,
      description: description || 'No description',
      type: type || 'GoatBot',
      code,
      rawID,
      authorName: authorName || 'Unknown',
      authorID: authorID || 'system',
      tags: tags || []
    });

    await newItem.save();

    const baseUrl = `${req.protocol}://${req.get('host')}`;

    res.json({
      success: true,
      itemID,
      rawID,
      link: `${baseUrl}/raw/${fileName}`,
      message: 'Command uploaded successfully'
    });
  } catch (error) {
    console.error('Error in POST /v1/paste:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to upload command' 
    });
  }
});

module.exports = router;
