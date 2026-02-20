// models/ContentFlag.js
import mongoose from "mongoose";

const contentFlagSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  category: { type: String, enum: ["hate", "violence", "self-harm"], required: true },
  severity: { type: String, enum: ["low", "medium", "high"], required: true },
  actionTaken: { type: String, enum: ["none", "masked", "blocked"], default: "none" },
}, { timestamps: true });

export default mongoose.model("ContentFlag", contentFlagSchema);
