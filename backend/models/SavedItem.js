const mongoose = require('mongoose');

const SavedItemSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ['worker', 'job'], required: true },
  savedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedItem', SavedItemSchema); 