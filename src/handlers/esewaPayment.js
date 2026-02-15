import { Router } from "express";

import { generateEsewaPayment, verifyEsewaPayment, handleEsewaFailure } from "../services/EsewaPayment.js";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";

const ESEWA_ROUTER = Router();




ESEWA_ROUTER.post("/initiatePayment", async (req, res) => {
  try {
    const { amount, orderId } = req.body;

    if (!amount || !orderId) {
      return res.status(400).json({
        success: false,
        message: "Amount and Order ID required",
      });
    }

    const paymentData = await generateEsewaPayment(amount, orderId);

    return res.status(200).json({
      success: true,
      data: paymentData,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});


ESEWA_ROUTER.get("/success", async (req, res) => {
  try {
    let transaction_uuid;
    let total_amount;

    // 🔹 eSewa v2 sandbox sends base64 encoded data
    if (req.query.data) {
      const decodedData = Buffer.from(req.query.data, "base64").toString("utf-8");
      const paymentInfo = JSON.parse(decodedData);

      transaction_uuid = paymentInfo.transaction_uuid;
      total_amount = paymentInfo.total_amount;

      console.log("Decoded eSewa Data:", paymentInfo);

      // Optional: quick status check before verify API
      if (paymentInfo.status !== "COMPLETE") {
          return res.redirect(
          `${process.env.FRONTEND_URL}/esewa-payment-failed?error=PaymentNotComplete`
        );
      }
    } else {
      // 🔹 fallback for older / direct calls
      transaction_uuid = req.query.transaction_uuid;
      total_amount = req.query.total_amount;
    }

    if (!transaction_uuid || !total_amount) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/esewa-payment-failed?error=MissingPaymentData`
      );

    }


    const order = await Order.findById(transaction_uuid);
    if (!order) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/esewa-payment-failed?error=OrderNotFound`
      );
    }

    if (order.status === "paid") {
       return res.redirect(
        `${process.env.FRONTEND_URL}/esewa-payment-failed?error=OrderAlreadyPaid`
      );
    }

    // 🔹 Verify with eSewa
    const verification = await verifyEsewaPayment(
      transaction_uuid,
      total_amount
    );

    if (verification.status !== "COMPLETE") {
       return res.redirect(
        `${process.env.FRONTEND_URL}/esewa-payment-failed?error=VerificationFailed`
      );
    }

    // ✅ UPDATE ORDER
    order.status = "paid";
    await order.save();

    // ✅ CREATE PAYMENT RECORD
    await Payment.create({
      order: order._id,
      paymentMethod: "eSewa",
      paymentStatus: "paid",
      transactionId: transaction_uuid,
      paidAt: new Date(),
    });


    {/*return res.send("Payment Successful");  */ }  //Replace it with frontend url page

    return res.redirect(
      `${process.env.FRONTEND_URL}/esewa-payment-success?orderId=${order._id}`
    );


  } catch (err) {
    console.error("eSewa success error:", err.message);
    return res.redirect(
      `${process.env.FRONTEND_URL}/esewa-payment-failed?error=ServerError`
    );
  }
});





/*


ESEWA_ROUTER.post("/initiatePayment",

async (req, res) => {
  const { amount } = req.body;

  if (!amount) {
    return res.status(400).json({ error: "Amount is required" });
  }

  const paymentData = generateEsewaPayment(amount);

  res.json(paymentData);
}

);



ESEWA_ROUTER.get("/success", async (req, res) => {
  try {
    let transaction_uuid;
    let total_amount;

    // 🔹 eSewa v2 sandbox sends base64 encoded data
    if (req.query.data) {
      const decodedData = Buffer.from(req.query.data, "base64").toString("utf-8");
      const paymentInfo = JSON.parse(decodedData);

      transaction_uuid = paymentInfo.transaction_uuid;
      total_amount = paymentInfo.total_amount;

console.log("Decoded eSewa Data:", paymentInfo);

      // Optional: quick status check before verify API
      if (paymentInfo.status !== "COMPLETE") {
        return res.send("Payment Failed");
      }
    } else {
      // 🔹 fallback for older / direct calls
      transaction_uuid = req.query.transaction_uuid;
      total_amount = req.query.total_amount;
    }

    if (!transaction_uuid || !total_amount) {
      return res.status(400).send("Missing required payment data");
    }

    // 🔹 Verify with eSewa
    const verificationResult = await verifyEsewaPayment(
      transaction_uuid,
      total_amount
    );


    if (verificationResult.status === "COMPLETE") {
      return res.send("Payment Successful");
    }

    res.send("Payment Verification Failed");
  } catch (err) {
    console.error("eSewa success error:", err.message);
    res.status(500).send("Verification Error");
  }
});


*/

ESEWA_ROUTER.get("/failure",

  (req, res) => {
    const message = handleEsewaFailure();
    res.send(message);
  }


);







export default ESEWA_ROUTER;