// models/UserPreference.js
import mongoose from "mongoose";

const userPreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  defaultModel: { type: String, default: "gpt-3.5" },
  temperature: { type: Number, default: 0.7 },
  tone: { type: String, enum: ["formal", "casual"], default: "formal" },
  theme: { type: String, enum: ["light", "dark"], default: "light" },
}, { timestamps: true });

export default mongoose.model("UserPreference", userPreferenceSchema);
