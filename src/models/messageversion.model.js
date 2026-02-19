// models/MessageVersion.js
import mongoose from "mongoose";

const messageVersionSchema = new mongoose.Schema({
  messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message", required: true },
  content: { type: String, required: true },
  model: { type: String, default: "gpt-3.5" },
  tokenCount: { type: Number, default: 0 },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model("MessageVersion", messageVersionSchema);
