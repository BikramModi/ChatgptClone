// models/UsageMetric.js
import mongoose from "mongoose";

const usageMetricSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  periodStart: { type: Date, required: true },
  periodEnd: { type: Date, required: true },
  totalMessages: { type: Number, default: 0 },
  totalTokens: { type: Number, default: 0 },
  totalCost: { type: mongoose.Types.Decimal128, default: 0.0 },
}, { timestamps: true });

export default mongoose.model("UsageMetric", usageMetricSchema);
