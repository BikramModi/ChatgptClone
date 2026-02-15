import axios from "axios";
import { KHALTI_API } from "../utils/khalti.js";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

export const initiatePaymentService = async ({ amount, orderId }) => {
  if (!amount || !orderId) {
    throw new Error("Amount & Order ID required");
  }

  // 1️⃣ Validate order
      const order = await Order.findById(orderId);
      if (!order) throw new Error("Order not found");
    
      if (order.status === "paid") {
        throw new Error("Order already paid");
      }
    
      // 2️⃣ Check if payment already PAID for this order
      const existingPaidPayment = await Payment.findOne({
        order: orderId,
        paymentStatus: "paid",
      });
    
      if (existingPaidPayment) {
        throw new Error("Payment already completed for this order");
      }
    
      // (Optional but recommended)
      // 3️⃣ Check if a payment is already pending
      const existingPendingPayment = await Payment.findOne({
        order: orderId,
        paymentStatus: "pending",
      });
    
      if (existingPendingPayment) {
        throw new Error("Payment is already in progress for this order");
      }

  const response = await axios.post(
    KHALTI_API.INITIATE_PAYMENT,
    {
      return_url: "http://localhost:6003/payment/khalti/verify",
      website_url: "http://localhost:6003",
      amount: amount * 100, // convert to paisa
      purchase_order_id: orderId,
      purchase_order_name: "Test Order",
    },
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
    }
  );

  await Payment.create({
  order: orderId,
  paymentMethod: "khalti",
  paymentStatus: "pending",
  transactionId: response.data.pidx, // <--- store this!
  amount: order.totalAmount,
});


  return response.data;
};




/**
 * Verify Khalti Payment
 * @param {String} pidx - Payment ID returned by Khalti
 * @returns {Object} response from Khalti API
 */
export const verifyPaymentService = async (pidx) => {
  if (!pidx) {
    throw new Error("pidx required");
  }

  const response = await axios.post(
    KHALTI_API.VERIFY_PAYMENT,
    { pidx },
    {
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
      },
    }
  );

  return response.data;
};
