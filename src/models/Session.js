// models/session.js
import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: String,
    ipAddress: String,
    expiresAt: Date,
    
    refreshToken: { type: String, required: true },

    isValid: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Session", sessionSchema);
