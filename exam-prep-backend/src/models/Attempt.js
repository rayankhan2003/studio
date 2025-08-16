
const mongoose = require('mongoose');

// Represents a user's attempt at a test
const AttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test' }, // For pre-defined tests
  testName: { type: String, required: true }, // For custom or pre-defined tests
  curriculum: { type: String, required: true },
  testType: { type: String, enum: ['Custom', 'Past Paper'], required: true },
  overallScorePercentage: { type: Number, required: true },
  subjectScores: { type: Map, of: Number }, // { "Biology": 85.5, "Physics": 70.0 }
  chapterScores: { type: Map, of: new mongoose.Schema({ _id: false, scores: { type: Map, of: Number } }) }, // { "Biology": { "Genetics": 90, ... } }
  answers: [{
    question: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean
  }],
  timeTaken: { type: Number }, // in seconds
}, { timestamps: true });

module.exports = mongoose.model('Attempt', AttemptSchema);
