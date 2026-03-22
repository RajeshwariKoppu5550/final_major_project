const mongoose = require('mongoose');

const WorkerPostSchema = new mongoose.Schema({
  workerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: String,
  skill: String, // Singuluar in frontend
  skills: [String], // Array for future flexibility
  experience: Number,
  pincode: String,
  expectedWage: String, // String in frontend ("₹600/hour")
  description: String, // Frontend uses "description"
  bio: String, // Some components might use "bio"
  phone: String,
  mobile: String, // Frontend uses "mobile"
  createdAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['active', 'inactive'], default: 'active' }
});

module.exports = mongoose.model('WorkerPost', WorkerPostSchema); 