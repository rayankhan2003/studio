
import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    className: { type: String, required: true }, // e.g., "1st Year", "A Level Year 2"
    stream: { type: String, required: true, enum: ["Pre-Medical", "Pre-Engineering", "Computer Science", "Arts"] }, // e.g., "Pre-Medical"
    section: { type, String, required: true }, // e.g. "A", "B"
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution", required: true },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Map subjects to specific teachers for this section
    // e.g., { "Biology": "teacherId1", "Chemistry": "teacherId2" }
    subjectTeacherAssignments: {
        type: Map,
        of: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    },
    name: { type: String } // Auto-generated full name for display
  },
  { timestamps: true }
);

// Auto-generate the full name before saving
sectionSchema.pre('save', function(next) {
    this.name = `${this.className} - ${this.stream} (Section ${this.section})`;
    next();
});


sectionSchema.index({ institution: 1, name: 1 }, { unique: true });

export default mongoose.model("Section", sectionSchema);
