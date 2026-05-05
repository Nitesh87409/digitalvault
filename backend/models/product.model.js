const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  description:    { type: String },
  images:         { type: [String], default: [] }, // Array of image paths
  original_price: { type: Number, required: true },
  sale_price:     { type: Number, required: true },
  file_url:       { type: String, required: true },
  status:         { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);