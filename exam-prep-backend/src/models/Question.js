
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["O Level", "A Level", "MDCAT"], required: true },
    subject: { type: String, required: true },
    chapter: { type: String, required: true },
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: v => Array.isArray(v) && v.length > 0
    },
    correctAnswer: { type: mongoose.Schema.Types.Mixed, required: true }, // String for single, Array for multiple
    explanation: { type: String, default: "" },
    type: { type: String, enum: ['single-choice', 'multiple-choice', 'fill-in-the-blank', 'true-false'], default: 'single-choice' },
    tags: [String],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
