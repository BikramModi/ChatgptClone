import Router from "express";
import USER_ROUTER from "./user.js";
import AUTH_ROUTER from "./auth.js";
import CATEGORY_ROUTER from "./Category.js";
import PRODUCT_ROUTER from "./Product.js";
import CART_ROUTER from "./Cart.js";
import ORDER_ROUTER from "./Order.js";
import PAYMENT_ROUTER from "./Payment.js";
import REVIEW_ROUTER from "./Review.js";
import ESEWA_ROUTER from "./esewaPayment.js";
import KHALTI_ROUTER from "./KhaltiPayment.js";


const HANDLERS = Router();


HANDLERS.use("/users", USER_ROUTER);
HANDLERS.use("/auth", AUTH_ROUTER);
HANDLERS.use("/categories", CATEGORY_ROUTER);
HANDLERS.use("/:catId/products", PRODUCT_ROUTER);
HANDLERS.use("/CartItems",CART_ROUTER);
HANDLERS.use("/orders", ORDER_ROUTER);
HANDLERS.use("/payments", PAYMENT_ROUTER);
HANDLERS.use("/reviews", REVIEW_ROUTER);
HANDLERS.use("/payment/esewa", ESEWA_ROUTER);
HANDLERS.use("/payment/khalti", KHALTI_ROUTER);


export default HANDLERS;
