import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },



  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    default: "pending" // pending, paid, shipped, delivered
  }
}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
