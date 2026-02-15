import {Schema, model} from "mongoose";

const cartSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  }
}, { timestamps: true });

const Cart = model("Cart", cartSchema);

export default Cart;
