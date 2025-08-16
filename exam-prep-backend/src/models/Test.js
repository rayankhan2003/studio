
const mongoose = require('mongoose');

// Represents a pre-defined test, like a past paper
const TestSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "MDCAT 2022 Practice Test"
  curriculum: { type: String, required: true },
  testType: { type: String, enum: ['Custom', 'Past Paper'], default: 'Past Paper' },
  duration: { type: Number, required: true }, // in seconds
  questions: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Question' }]
}, { timestamps: true });

module.exports = mongoose.model('Test', TestSchema);
