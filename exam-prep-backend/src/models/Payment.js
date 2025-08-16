
const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true, unique: true }, // From payment gateway
  amount: { type: Number, required: true },
  currency: { type: String, default: 'PKR' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], required: true },
  plan: { type: String, required: true }, // e.g., 'Monthly'
  gateway: { type: String, required: true }, // e.g., 'Stripe', 'PayPal'
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
