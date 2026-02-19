// models/Message.js
import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  conversationId: { type: mongoose.Schema.Types.ObjectId, ref: "Conversation", required: true },
  role: { type: String, enum: ["user", "assistant", "system"], required: true },
  content: { type: String, required: true },
  tokenCount: { type: Number, default: 0 },
  latencyMs: { type: Number, default: 0 },
  status: { type: String, enum: ["completed", "streaming", "failed"], default: "completed" },
}, { timestamps: { createdAt: true, updatedAt: false } });

export default mongoose.model("Message", messageSchema);
