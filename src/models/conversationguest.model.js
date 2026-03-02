// models/Conversation.js
import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema({
  title: { type: String, default: "New Chat" },
  model: { type: String, default: "gpt-3.5" },
  systemPrompt: { type: String, default: "" },
  visibility: { type: String, enum: ["private", "shared"], default: "private" },
  isArchived: { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model("ConversationGuest", conversationSchema);
