import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    plan: { type: String, enum: ["monthly", "yearly", "lifetime"], required: true },
    amount: Number,
    currency: { type: String, default: "usd" },
    provider: { type: String, enum: ["stripe"], default: "stripe" },
    providerPaymentId: String,
    status: { type: String, enum: ["pending", "succeeded", "failed"], default: "pending" }
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
