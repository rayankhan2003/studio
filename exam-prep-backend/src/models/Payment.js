import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    institutionId: { type: mongoose.Schema.Types.ObjectId, ref: "Institution" }, // Added
    plan: { type: String, enum: ["monthly", "yearly", "lifetime", "institutional"], required: true }, // Added institutional
    amount: Number,
    currency: { type: String, default: "pkr" },
    provider: { type: String, enum: ["stripe"], default: "stripe" },
    providerPaymentId: String,
    status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

    