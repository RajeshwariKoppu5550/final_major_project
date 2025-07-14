const mongoose = require('mongoose');

const ContractorProfileSchema = new mongoose.Schema({
  companyName: String,
  companyType: String,
  businessLocation: String,
  description: String,
  phone: String
}, { _id: false });

const WorkerProfileSchema = new mongoose.Schema({
  skills: [String],
  experience: Number,
  location: String,
  hourlyRate: Number,
  availability: String,
  bio: String,
  phone: String,
  pincode: String,
  expectedWage: Number
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, enum: ['contractor', 'worker'], required: true },
  profile: {
    type: mongoose.Schema.Types.Mixed // Can be ContractorProfile or WorkerProfile
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema); 