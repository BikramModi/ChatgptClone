import { Router } from "express";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import {
  initiatePaymentService,
  verifyPaymentService,
} from "../services/KhaltiPayment.js";

const KHALTI_ROUTER = Router();

/* ================= INITIATE ================= */
KHALTI_ROUTER.post("/initiate", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Amount and Order ID required",
      });
    }

    const data = await initiatePaymentService({ amount, orderId });
    return res.json(data);
  } catch (error) {
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

/* ================= VERIFY ================= */
KHALTI_ROUTER.get("/verify", async (req, res) => {
  try {
    const { pidx } = req.query;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    const verification = await verifyPaymentService(pidx);
    console.log("Verification Data:", verification);

    /* ✅ Correct status check */
    if (verification.status !== "Completed") {
      return res.status(400).json({
        message: "Payment not completed",
        status: verification.status,
      });
    }


    // ✅ Find payment by pidx
    const payment = await Payment.findOne({ transactionId: pidx });
    if (!payment) return res.status(404).json({ message: "Payment not found" });

    // ✅ Find order
    const order = await Order.findById(payment.order);
    if (!order) return res.status(404).json({ message: "Order not found" });




    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    /* ✅ Prevent duplicate order payment */
    if (order.status === "paid") {
      return res.json({ message: "Order already paid" });
    }



    /* ✅ Update order */
    order.status = "paid";
    await order.save();

    /* ✅ Save payment */
    await Payment.create({
      order: order._id,
      paymentMethod: "khalti",
      paymentStatus: "paid",
      transactionId: verification.transaction_id,
      amount: verification.total_amount / 100,
      paidAt: new Date(),
    });

    /*return res.json({
      success: true,
      message: "Payment verified successfully",
    });
    */

    return res.redirect(
      `${process.env.FRONTEND_URL}/khalti-payment-success?orderId=${order._id}`
    );


  } catch (error) {
    return res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});

export default KHALTI_ROUTER;







/*
import {Router} from "express";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

import { initiatePaymentService, verifyPaymentService } from "../services/KhaltiPayment.js";


const KHALTI_ROUTER = Router();


KHALTI_ROUTER.post("/initiate", 

async (req, res) => {
  try {
    const { amount, orderId } = req.body;

     if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Amount and Order ID required",
      });
    }

    const data = await initiatePaymentService({ amount, orderId });

    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
}

);



KHALTI_ROUTER.post("/verify", async (req, res) => {
  try {
    const { pidx } = req.body;

    if (!pidx) {
      return res.status(400).json({ message: "pidx is required" });
    }

    const verification = await verifyPaymentService(pidx);

    console.log("Verification Data:", verification);

    // ✅ Correct Khalti status
    if (verification.status !== "Completed") {
      return res.status(400).send("Payment verification failed");
    }

    // ✅ Find order using purchase_order_id
    const order = await Order.findOne({
      _id: verification.purchase_order_id,
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ✅ Prevent duplicate payment
    if (order.status === "paid") {
      return res.json({ message: "Order already paid" });
    }

    // ✅ Update order
    order.status = "paid";
    await order.save();

    // ✅ Create payment record
    await Payment.create({
      order: order._id,
      paymentMethod: "khalti",
      paymentStatus: "paid",
      transactionId: verification.transaction_id,
      amount: verification.total_amount / 100,
      paidAt: new Date(),
    });

    return res.send("Payment Successful");
  } catch (error) {
    res.status(500).json({
      error: error.response?.data || error.message,
    });
  }
});



export default KHALTI_ROUTER;
*/





