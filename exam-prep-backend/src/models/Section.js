
import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true }, // e.g., "Class 12-A", "Pre-Med Morning"
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subjects: [String] // e.g., ["Biology", "Physics"]
  },
  { timestamps: true }
);

sectionSchema.index({ institution: 1, name: 1 }, { unique: true });

export default mongoose.model("Section", sectionSchema);
