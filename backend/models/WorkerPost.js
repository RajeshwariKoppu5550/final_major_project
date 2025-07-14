const mongoose = require('mongoose');

const WorkerPostSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  skills: [String],
  experience: Number,
  pincode: String,
  expectedWage: Number,
  bio: String,
  phone: String,
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('WorkerPost', WorkerPostSchema); 