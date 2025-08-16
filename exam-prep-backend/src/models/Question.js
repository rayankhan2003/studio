
const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  type: { type: String, enum: ['single-choice', 'multiple-choice', 'fill-in-the-blank', 'true-false'], required: true },
  options: [{ type: String }],
  correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // Can be String or Array of Strings
  explanation: { type: String },
  subject: { type: String, required: true },
  chapter: { type: String, required: true },
  curriculum: { type: String, required: true }, // e.g., 'MDCAT', 'O Level'
  difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } // Admin who added it
}, { timestamps: true });

module.exports = mongoose.model('Question', QuestionSchema);
