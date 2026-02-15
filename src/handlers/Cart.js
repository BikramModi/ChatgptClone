
import  Router  from "express";
import { addToCartService,getCartService,updateCartItemService,removeFromCartService } from "../services/Cart.js";


const CART_ROUTER = Router();

CART_ROUTER.post("/", async (req, res) => {
  try {
    console.log("🧾 BODY:", req.body);
    console.log("👤 USER:", req.user);

    const { product, quantity } = req.body;

    if (!product || !quantity) {
      return res.status(400).json({ message: "product and quantity are required" });
    }

    const result = await addToCartService({
      userId: req.user.userId,
      product: product,
      quantity
    });

     // 🔥 Send full result to frontend
    res.status(200).json(result);

  } catch (error) {
    console.error("🔥 ADD TO CART ERROR:", error);

    res.status(500).json({
      message: error.message,
      stack: error.stack
    });
  }
});






CART_ROUTER.get("/getCartItems",

    async (req, res) => {
  try {
    const userId = req.user.userId;

    const cartData = await getCartService(userId);

    res.json(cartData);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
}
);


CART_ROUTER.patch("/:id",

async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    const result = await updateCartItemService({
      userId: req.user.userId,
      itemId,
      quantity
    });

    res.json(result);

  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({ message: "Item not found" });
    }

    if (error.message === "NOT_AUTHORIZED") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(500).json({ message: "Server error" });
  }
}
);


export const updateCartItemHandler = async (req, res) => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.id;

    const result = await updateCartItemService({
      userId: req.user.userId,
      itemId,
      quantity
    });

    res.json(result);

  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({ message: "Item not found" });
    }

    if (error.message === "NOT_AUTHORIZED") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(500).json({ message: "Server error" });
  }
};


CART_ROUTER.delete("/:id",

    async (req, res) => {
  try {
    const itemId = req.params.id;

    const result = await removeFromCartService({
      userId: req.user.userId,
      itemId
    });

    res.json(result);

  } catch (error) {
    if (error.message === "ITEM_NOT_FOUND") {
      return res.status(404).json({ message: "Item not found" });
    }

    if (error.message === "NOT_AUTHORIZED") {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(500).json({ message: "Server error" });
  }
}

);






export default CART_ROUTER;