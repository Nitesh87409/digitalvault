const mongoose = require('mongoose');

const CustomerSchema = new mongoose.Schema({
  name:     { type: String, required: true, trim: true },
  email:    { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone:    { type: String, required: true },
  password: { type: String, required: true },
  is_verified: { type: Boolean, default: false },
  otp:      { type: String, default: null },
  otp_expires: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Customer', CustomerSchema);