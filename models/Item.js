const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  itemID: {
    type: Number,
    unique: true,
    required: true
  },
  itemName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: 'No description'
  },
  type: {
    type: String,
    default: 'GoatBot',
    enum: ['GoatBot', 'Mirai', 'Other']
  },
  code: {
    type: String,
    required: true
  },
  rawID: {
    type: String,
    unique: true,
    required: true
  },
  authorName: {
    type: String,
    default: 'Unknown'
  },
  authorID: {
    type: String,
    default: 'system'
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index pour la recherche
itemSchema.index({ itemName: 'text', description: 'text', tags: 'text' });

// Incrémenter les vues
itemSchema.methods.incrementViews = async function() {
  this.views += 1;
  await this.save();
};

// Incrémenter les likes
itemSchema.methods.incrementLikes = async function() {
  this.likes += 1;
  await this.save();
};

module.exports = mongoose.model('Item', itemSchema);
