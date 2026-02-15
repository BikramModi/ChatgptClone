import { checkoutService,getUserOrdersService,getUserOrderByIdService, getAllOrdersService,getOrderByIdService,updateOrderStatusService } from "../services/Order.js";

import { Router } from "express";


const ORDER_ROUTER = Router();

ORDER_ROUTER.post("/checkout",
    
async (req, res) => {
  try {
    const result = await checkoutService(req.user.userId);

    res.json({
      message: "Order created",
      orderId: result.orderId
    });

  } catch (error) {
    if (error.message === "CART_EMPTY") {
      return res.status(400).json({ message: "Cart is empty" });
    }

    if (error.message.startsWith("OUT_OF_STOCK")) {
      const productName = error.message.split(":")[1];
      return res.status(400).json({
        message: `${productName} is out of stock`
      });
    }

    res.status(500).json({ message: "Server error" });
  }
}

);


ORDER_ROUTER.get("/getMyOrders",

async (req, res) => {
  try {
    const orders = await getUserOrdersService(req.user.userId);
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}

);

ORDER_ROUTER.get("/getMyOrder/:ordId",

async (req, res) => {
  try {
    const data = await getUserOrderByIdService({
      userId: req.user.userId,
      orderId: req.params.ordId
    });

    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
}
);


ORDER_ROUTER.get("/adminonly",

async (req, res, next) => {
  try {
    const { role } = req.user; // comes from authMiddleware

    console.log("User role in ORDER_ROUTER:", role); // Debugging line

    const orders = await getAllOrdersService({
      adminRole: role,
    });

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });

  } catch (error) {
    next(error); // forward to error middleware
  }
}

);





ORDER_ROUTER.get("/:ordId/adminonly",

async (req, res) => {
  try {
    const data = await getOrderByIdService({
      orderId: req.params.ordId,
      adminId: req.user.userId,
      adminRole: req.user.role
    });

    res.json(data);
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
}

);

ORDER_ROUTER.patch("/:ordId/adminonly", 

    async (req, res) => {
  try {
    await updateOrderStatusService({
      orderId: req.params.ordId,
      status: req.body.status,
      adminRole: req.user.role
    });

    res.json({ message: "Order status updated" });
  } catch (error) {
    res.status(error.statusCode || 500).json({
      message: error.message
    });
  }
}


);


export default ORDER_ROUTER;