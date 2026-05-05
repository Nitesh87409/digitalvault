const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
  name:               { type: String, required: true },
  email:              { type: String, required: true },
  phone:              { type: String, required: true },
  amount:             { type: Number, required: true },
  product_id:         { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  payment_status:     { type: Number, enum: [0, 1, 2], default: 0 },
  razorpay_order_id:  { type: String },
  razorpay_payment_id:{ type: String },
  razorpay_signature: { type: String },
  download_token:     { type: String },
  token_expires_at:   { type: Date },
  download_count:     { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Order', OrderSchema);