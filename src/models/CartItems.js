import {Schema, model} from "mongoose";

const cartItemSchema = new Schema({
  cart: {
    type: Schema.Types.ObjectId,
    ref: "Cart",
    required: true
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  quantity: { type: Number, required: true }
}, { timestamps: true });


const CartItem = model("CartItem", cartItemSchema);

export default CartItem;

