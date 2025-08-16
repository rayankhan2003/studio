
import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: String, enum: ["O Level", "A Level"], required: true },
    subject: { type: String, enum: ["Biology", "Physics", "Chemistry"], required: true },
    chapterFilter: { type: [String], default: [] }, // optional filter
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    durationMin: { type: Number, default: 30 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
