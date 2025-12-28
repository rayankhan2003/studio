
import mongoose from "mongoose";

const institutionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    institutionType: { type: String, enum: ["Public", "Private"], required: true },
    businessType: { type: String, enum: ["College", "School", "Academy"], required: true },
    province: { type: String, required: true },
    city: { type: String, required: true },
    admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    teachers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    sections: [{ type: mongoose.Schema.Types.ObjectId, ref: "Section" }],
    subscriptionPlan: { type: String, default: "institutional" },
    subscriptionStatus: { type: String, enum: ["active", "inactive"], default: "active" },
  },
  { timestamps: true }
);

export default mongoose.model("Institution", institutionSchema);
