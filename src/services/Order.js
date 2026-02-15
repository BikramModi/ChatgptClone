import Cart from "../models/Cart.js";
import CartItem from "../models/CartItems.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItems.js";

export const checkoutService = async (userId) => {
  // 1. Get cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) throw new Error("CART_EMPTY");

  // 2. Get cart items with product info
  const cartItems = await CartItem.find({ cart: cart._id })
    .populate("product", "price stock name");

  if (cartItems.length === 0) {
    throw new Error("CART_EMPTY");
  }

  // 3. Calculate total & validate stock
  let total = 0;
  for (const item of cartItems) {
    if (item.quantity > item.product.stock) {
      throw new Error(`OUT_OF_STOCK:${item.product.name}`);
    }
    total += item.quantity * item.product.price;
  }

  // 4. Static charges
  const shipping = 150;
  const tax = Math.round(total * 0.05);

  // 5. Final total
  const totalfinal = total + shipping + tax;

  // 4. Create order
  const order = await Order.create({
    user: userId,
    totalAmount: totalfinal,
    status: "pending"
  });

  // 5. Create order items
  for (const item of cartItems) {
    await OrderItem.create({
      order: order._id,
      product: item.product._id,
      quantity: item.quantity,
      price: item.product.price
    });
  }

  // 6. Clear cart
  await CartItem.deleteMany({ cart: cart._id });

  return { orderId: order._id };
};


export const getUserOrdersService = async (userId) => {
  const data = await Order.find({ user: userId }).sort({ createdAt: -1 });
  return { data };
};


export const getUserOrderByIdService = async ({ userId, orderId }) => {
  const order = await Order.findOne({ _id: orderId, user: userId });
  if (!order) {
    throw new Error("Order not found");
  }
  const items = await OrderItem.find({ order: order._id })
    .populate("product", "name price image");

  return { order, items };
};

export const getAllOrdersService = async ({ adminRole }) => {

  console.log("Admin role for fetching all orders:", adminRole); // Debugging line
  if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const orders = await Order.find()
    .populate("user", "name email phone");

  return orders;
};




export const getOrderByIdService = async ({ orderId, adminId, adminRole }) => {
  const order = await Order.findById(orderId)
    .populate("user", "name email");

  console.log("Fetched order:", order); // Debugging line
  console.log("Requesting user:", adminId); // Debugging line
  console.log("Requesting user role:", adminRole); // Debugging line

  if (!order) {
    throw new Error("Order not found");
  }

  // Authorization check
  if (
    //order.user._id.toString() !== adminId &&
    //adminRole !== "admin"
    adminRole !== "admin"
  ) {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const items = await OrderItem.find({ order: order._id })
    .populate("product", "name price image");

  return { order, items };
};



export const updateOrderStatusService = async ({ orderId, status, adminRole }) => {
  // Admin check
  console.log("Admin role for status update:", adminRole); // Debugging line

  if (adminRole !== "admin") {
    const error = new Error("Admin only");
    error.statusCode = 403;
    throw error;
  }

  const order = await Order.findById(orderId);
  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  order.status = status;
  await order.save();

  return order;
};
