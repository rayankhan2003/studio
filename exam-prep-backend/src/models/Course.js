
import mongoose from "mongoose";

const chapterSchema = new mongoose.Schema(
  { title: { type: String, required: true }, order: Number },
  { _id: false }
);

const subjectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    chapters: [chapterSchema]
  },
  { _id: false }
);

const courseSchema = new mongoose.Schema(
  {
    level: { type: String, enum: ["O Level", "A Level"], required: true },
    subjects: [subjectSchema]
  },
  { timestamps: true }
);

courseSchema.index({ level: 1 }, { unique: true });

export default mongoose.model("Course", courseSchema);
