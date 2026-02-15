import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true
  },
  paymentMethod: String,
  paymentStatus: String,
  transactionId: String,
  paidAt: Date
}, { timestamps: true });

export default mongoose.model("Payment", paymentSchema);
