const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const os = require('os');

// GET /api/stats - Statistiques du marketplace
router.get('/', async (req, res) => {
  try {
    const totalCommands = await Item.countDocuments();
    
    const totalLikesResult = await Item.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } }
    ]);
    const totalLikes = totalLikesResult[0]?.total || 0;

    const dailyActiveUsers = await Item.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setDate(new Date().getDate() - 1))
          }
        }
      },
      { $group: { _id: "$authorID" } },
      { $count: "count" }
    ]);

    const popularTags = await Item.aggregate([
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topAuthors = await Item.aggregate([
      { $group: { _id: "$authorName", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    const topViewed = await Item.find()
      .sort({ views: -1 })
      .limit(5)
      .select('itemName itemID views');

    // Informations d'hébergement
    const uptime = process.uptime();
    const days = Math.floor(uptime / 86400);
    const hours = Math.floor((uptime % 86400) / 3600);
    const minutes = Math.floor(((uptime % 86400) % 3600) / 60);
    const seconds = Math.floor(((uptime % 86400) % 3600) % 60);

    res.json({
      success: true,
      stats: {
        hosting: {
          uptime: {
            days,
            hours,
            minutes,
            seconds,
            total: uptime
          },
          system: {
            platform: os.platform(),
            arch: os.arch(),
            nodeVersion: process.version,
            cpuCores: os.cpus().length,
            memory: {
              total: os.totalmem(),
              free: os.freemem()
            }
          }
        },
        totalCommands,
        totalLikes,
        dailyActiveUsers: dailyActiveUsers[0]?.count || 0,
        popularTags,
        topAuthors,
        topViewed
      }
    });
  } catch (error) {
    console.error('Error in GET /stats:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics' 
    });
  }
});

module.exports = router;
