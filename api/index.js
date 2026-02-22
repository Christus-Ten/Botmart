const express = require('express');
const router = express.Router();
const path = require('path');

// Imports avec chemins absolus
const itemsRoute = require(path.join(__dirname, 'items.js'));
const itemRoute = require(path.join(__dirname, 'item.js'));
const trendingRoute = require(path.join(__dirname, 'trending.js'));
const statsRoute = require(path.join(__dirname, 'stats.js'));
const pasteRoute = require(path.join(__dirname, 'paste.js'));

router.use('/items', itemsRoute);
router.use('/item', itemRoute);
router.use('/trending', trendingRoute);
router.use('/stats', statsRoute);
router.use('/v1/paste', pasteRoute);

module.exports = router;
