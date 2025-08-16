
import mongoose from "mongoose";

const questionSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["O Level", "A Level"], required: true },
    subject: { type: String, enum: ["Biology", "Physics", "Chemistry"], required: true },
    chapter: { type: String, required: true },
    text: { type: String, required: true },
    options: {
      type: [String],
      validate: v => Array.isArray(v) && v.length === 4
    },
    correctAnswer: { type: String, required: true },
    explanation: { type: String, default: "" },
    tags: [String],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Question", questionSchema);
