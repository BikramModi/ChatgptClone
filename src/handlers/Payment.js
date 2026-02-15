import {Router} from "express";
import { createPaymentIntentService, handleStripePaymentSuccess } from "../services/Payment.js";
import express from "express";

import stripe from "../utils/stripe.js";


const PAYMENT_ROUTER = Router();

PAYMENT_ROUTER.post("/create-payment-intent",

    async (req, res) => {
  try {
    const { orderId, amount } = req.body;

    // Basic validation
    if (!orderId) {
      return res.status(400).json({ message: "Order ID is required" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const paymentData = await createPaymentIntentService({
      orderId,
      amount
    });

    res.status(200).json(paymentData);

  } catch (error) {
    res.status(400).json({
      message: error.message
    });
  }
}
 );

/*
PAYMENT_ROUTER.post("/webhook",

express.raw({ type: "application/json" }),

async (req, res) => {
  const signature = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,                 // RAW BODY
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  // React ONLY to successful payments
  if (event.type === "payment_intent.succeeded") {
    await handleStripePaymentSuccess(event.data.object);
  }

  res.status(200).json({ received: true });
}


);
*/

PAYMENT_ROUTER.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const signature = req.headers["stripe-signature"];
    console.log("➡️ Incoming webhook headers:", req.headers);

    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body, // RAW BODY
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
      console.log("✅ Stripe signature verified");
    } catch (error) {
      console.error("❌ Webhook signature verification failed:", error.message);
      return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("➡️ Stripe event received:", event.type, event.data.object, event.data.object.id);
  

    if (event.type === "payment_intent.succeeded") {
      try {
        await handleStripePaymentSuccess(event.data.object);
        console.log("✅ handleStripePaymentSuccess executed");
      } catch (err) {
        console.error("❌ Error in handleStripePaymentSuccess:", err.message);
      }
    }

    res.status(200).json({ received: true });
  }
);



 export default PAYMENT_ROUTER;

