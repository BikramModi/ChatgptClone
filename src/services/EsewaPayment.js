
import crypto from "crypto";
import axios from "axios";
import { ESEWA_CONFIG } from "../utils/esewa.js";

import Order from "../models/Order.js";
import Payment from "../models/Payment.js";


export const generateEsewaPayment = async (amount, orderId) => {
    // 🔑 Use orderId as transaction_uuid
  const transaction_uuid = orderId.toString();
  const productCode = process.env.ESEWA_MERCHANT_CODE;

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

  const data = `total_amount=${amount},transaction_uuid=${transaction_uuid},product_code=${productCode}`;

  const signature = crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
    .update(data)
    .digest("base64");

  return {
    amount,
    transaction_uuid: transaction_uuid,
    product_code: productCode,
    signature,
    success_url: `${process.env.BASE_URL}/payment/esewa/success`,
    failure_url: `${process.env.BASE_URL}/payment/esewa/failure`,
  };
};

/*
export const generateEsewaPayment = (amount) => {
  const transactionUuid = uuidv4();
  const productCode = process.env.ESEWA_MERCHANT_CODE;

  const data = `total_amount=${amount},transaction_uuid=${transactionUuid},product_code=${productCode}`;

  const signature = crypto
    .createHmac("sha256", process.env.ESEWA_SECRET_KEY)
    .update(data)
    .digest("base64");

  return {
    amount,
    transaction_uuid: transactionUuid,
    product_code: productCode,
    signature,
    success_url: `${process.env.BASE_URL}/payment/esewa/success`,
    failure_url: `${process.env.BASE_URL}/payment/esewa/failure`,
  };
};
*/



export const verifyEsewaPayment = async (transactionUuid, totalAmount) => {
  try {
    const response = await axios.get(
      `${ESEWA_CONFIG.VERIFY_URL}?product_code=${process.env.ESEWA_MERCHANT_CODE}&transaction_uuid=${transactionUuid}&total_amount=${totalAmount}`,
      { timeout: 10000 }


    );


    //use timeout for request
    // Return the full response or status
    //return response.data;
 
    return response.data;

  } catch (err) {
    throw new Error("Verification Failed");
  }
};


/*
export const verifyEsewaPayment = async (transactionUuid, totalAmount) => {
  try {
    const url = `${ESEWA_CONFIG.VERIFY_URL}?product_code=${process.env.ESEWA_MERCHANT_CODE}&transaction_uuid=${transactionUuid}&total_amount=${totalAmount}`;

    console.log("🔍 eSewa verify URL:", url);

    const response = await axios.get(url, {
      timeout: 10000,
    });

    console.log("✅ eSewa verify response:", response.data);

    return response.data;
  } catch (err) {
    console.error("❌ eSewa verify failed");

    if (err.response) {
      // eSewa responded with error status
      console.error("Status:", err.response.status);
      console.error("Data:", err.response.data);
    } else if (err.request) {
      // No response from eSewa
      console.error("No response received from eSewa");
    } else {
      // Axios setup error
      console.error("Error message:", err.message);
    }

    throw err; // rethrow real error
  }
};
*/

// esewaService.js

/**
 * Handle eSewa payment failure
 * Currently, it just returns a message, but you can extend it to log failures
 */
export const handleEsewaFailure = () => {
  return "Payment Failed";
};
