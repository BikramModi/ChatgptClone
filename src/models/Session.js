// models/AuthSession.js
import mongoose from "mongoose";

const authSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    refreshToken: {
      type: String,
      required: true,
    },

    ipAddress: {
      type: String,
    },

    userAgent: {
      type: String,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
      default: null,
    },

    isValid: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

// Optional: Auto invalidate if revoked
authSessionSchema.pre("save", function (next) {
  if (this.revokedAt) {
    this.isValid = false;
  }
  //next();
});

const AuthSession = mongoose.model("AuthSession", authSessionSchema);

export default AuthSession;
