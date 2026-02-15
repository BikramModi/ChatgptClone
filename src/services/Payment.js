import stripe from "../utils/stripe.js";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";








export const createPaymentIntentService = async ({ orderId, amount }) => {
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

  // 4️⃣ Create Stripe PaymentIntent
  const paymentIntent = await stripe.paymentIntents.create({

  amount,
  currency: "usd",
  automatic_payment_methods: { enabled: true },
  metadata: {
    orderId: order._id.toString(),
  },

  });

  // 5️⃣ Save payment as PENDING
  await Payment.create({
    order: order._id,
    paymentMethod: "stripe",
    paymentStatus: "pending",
    transactionId: paymentIntent.id,
  });

  return {
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount,
    currency: paymentIntent.currency,
    clientSecret: paymentIntent.client_secret,
  };
};







export const handleStripePaymentSuccess = async (paymentIntent) => {

console.log("PaymentIntent received in webhook:", paymentIntent);

  const orderId = paymentIntent.metadata.orderId;

  if (!orderId) {
    throw new Error("Order ID missing in payment metadata");
  }

  // 1️⃣ Update payment record
  const payment = await Payment.findOneAndUpdate(
    { transactionId: paymentIntent.id },
    {
      paymentStatus: "paid",
      paidAt: new Date()
    },
    { new: true }
  );

  if (!payment) {
    throw new Error("Payment record not found");
  }

  // 2️⃣ Update order status
  await Order.findByIdAndUpdate(orderId, {
    status: "paid"
  });
};
