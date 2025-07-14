const mongoose = require('mongoose');

const WorkPostSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contractorName: String,
  title: String,
  workType: String,
  pincode: String,
  description: String,
  budget: {
    min: Number,
    max: Number
  },
  startDate: String,
  endDate: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'closed'], default: 'active' }
});

module.exports = mongoose.model('WorkPost', WorkPostSchema); 