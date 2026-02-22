const express = require('express');
const router = express.Router();

const itemsRoute = require('./items');
const itemRoute = require('./item');
const trendingRoute = require('./trending');
const statsRoute = require('./stats');
const pasteRoute = require('./paste');

router.use('/items', itemsRoute);
router.use('/item', itemRoute);
router.use('/trending', trendingRoute);
router.use('/stats', statsRoute);
router.use('/v1/paste', pasteRoute);

module.exports = router;
