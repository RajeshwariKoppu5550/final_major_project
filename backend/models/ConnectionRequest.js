const mongoose = require('mongoose');

const ConnectionRequestSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  senderName: String,
  receiverName: String,
  type: { type: String, enum: ['worker_to_contractor', 'contractor_to_worker'], required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  workPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkPost' },
  workPostTitle: String,
  workerPostId: { type: mongoose.Schema.Types.ObjectId, ref: 'WorkerPost' },
  workerPostTitle: String,
  timestamp: { type: Date, default: Date.now },
  jobDetails: mongoose.Schema.Types.Mixed,
  workerDetails: mongoose.Schema.Types.Mixed
});

module.exports = mongoose.model('ConnectionRequest', ConnectionRequestSchema); 