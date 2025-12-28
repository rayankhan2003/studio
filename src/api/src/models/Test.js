
import mongoose from "mongoose";

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    level: { type: String, enum: ["O Level", "A Level", "MDCAT"], required: true },
    subject: { type: String, required: true },
    chapterFilter: { type: [String], default: [] }, // optional filter
    difficulty: { type: [String], enum: ["easy", "medium", "hard"], default: [] },
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
    durationMin: { type: Number, default: 30 },
    isPublished: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    allowGlobalRetake: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Test", testSchema);
