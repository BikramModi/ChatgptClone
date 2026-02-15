import Cart from "../models/Cart.js";
import CartItem from "../models/CartItems.js";

export const addToCartService = async ({ userId, product, quantity }) => {
  if (quantity <= 0) {
    throw new Error("INVALID_QUANTITY");
  }

  // 1. Find or create cart
  let cartt = await Cart.findOne({ user: userId });

  if (!cartt) {
    cartt = await Cart.create({ user: userId });
  }

  // 2. Find existing cart item
  let item = await CartItem.findOne({
    cart: cartt._id,
    product: product,
  });

  let updated = false;

  // 3. Update or create item
  if (item) {
    item.quantity += quantity;
    await item.save();
    updated = true;
  } else {
    await CartItem.create({
      cart: cartt._id,
      product: product,
      quantity,
    });
    updated = false;
  }

  // 4. Get full updated cart items
  const cartItems = await CartItem.find({ cart: cartt._id }).populate("product");

  return {
    message: updated
      ? "Quantity increased"
      : "Added to cart",
    updated,
    cart: cartItems,
  };
};




export const getCartService = async (userId) => {
  // 1. Find user cart
  const cart = await Cart.findOne({ user: userId });
  if (!cart) return { items: [], cartId: null };

  // 2. Get cart items and populate product
  const data = await CartItem.find({ cart: cart._id })
    .populate("product"); // populate product details

  return { data };
};




export const updateCartItemService = async ({ userId, itemId, quantity }) => {
  // 1. Find the cart item
  const item = await CartItem.findById(itemId);
  if (!item) throw new Error("ITEM_NOT_FOUND");

  // 2. Check if item belongs to user's cart
  const cart = await Cart.findOne({ _id: item.cart, user: userId });
  if (!cart) throw new Error("NOT_AUTHORIZED");

  // 3. Handle quantity <= 0 → delete item
  if (quantity <= 0) {
    await item.deleteOne();
    return { message: "Item removed" };
  }

  // 4. Update quantity
  item.quantity = quantity;
  await item.save();

  return { message: "Quantity updated" };
};



export const removeFromCartService = async ({ userId, itemId }) => {
  // 1. Find the cart item
  const item = await CartItem.findById(itemId);
  if (!item) throw new Error("ITEM_NOT_FOUND");

  // 2. Check if item belongs to user's cart
  const cart = await Cart.findOne({ _id: item.cart, user: userId });
  if (!cart) throw new Error("NOT_AUTHORIZED");

  // 3. Delete the item
  await item.deleteOne();

  return { message: "Item removed from cart" };
};
