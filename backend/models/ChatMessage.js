const mongoose = require('mongoose');

const ChatMessageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: String,
  timestamp: { type: Date, default: Date.now },
  read: { type: Boolean, default: false }
});

module.exports = mongoose.model('ChatMessage', ChatMessageSchema); 