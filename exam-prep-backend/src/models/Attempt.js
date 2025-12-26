
import mongoose from 'mongoose';

// Represents a user's attempt at a test
const AttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  test: { type: mongoose.Schema.Types.ObjectId, ref: 'Test', required: true },
  testName: { type: String }, // denormalized for easy display
  curriculum: { type: String, required: true },
  testType: { type: String, enum: ['Custom', 'Past Paper'], required: true },
  
  answers: [{
    _id: false,
    questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
    selectedAnswer: mongoose.Schema.Types.Mixed,
    isCorrect: Boolean
  }],
  
  score: { type: Number, default: 0 },
  totalQuestions: { type: Number, default: 0 },
  scorePercentage: { type: Number, default: 0 },
  
  subjectScores: { type: Map, of: { correct: Number, total: Number, percentage: Number }, default: {} },
  chapterScores: { type: Map, of: { type: Map, of: { correct: Number, total: Number, percentage: Number } }, default: {} },

  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  timeTaken: { type: Number }, // in seconds

  status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
}, { timestamps: true });

export default mongoose.model('Attempt', AttemptSchema);
