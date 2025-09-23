
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { ROLES } from "../utils/roles.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
    role: { type: String, enum: Object.values(ROLES), default: ROLES.STUDENT },
    
    // Fields for Institutional Module
    institution: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    institutionalRole: { type: String, enum: [ROLES.INSTITUTION_ADMIN, ROLES.TEACHER, ROLES.STUDENT] },
    subjects: [String], // For teachers to be assigned subjects
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
