import { Schema, model } from "mongoose";

const productSchema = new Schema({
  name: { type: String, required: true },
  description: String,

  price: { type: Number, required: true },          // Selling price
  originalPrice: { type: Number, required: true },  // MRP

  discount: { type: Number, default: 0 },           // % OFF (auto)

  stock: { type: Number, required: true },
  image: String,

  category: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: true
  }
}, { timestamps: true });

const Product = model("Product", productSchema);

export default Product;
