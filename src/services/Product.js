import Product from "../models/Products.js";
import NotFoundError from "../errors/not-found-error.js";

import cloudinary from "../utils/cloudinary.js";
import fs from "fs";
import path from "path";


import { getCategoryById } from "./Category.js";


 const createProduct = async (productData, adminRole) => {
  const {
    name,
    description,
    price,
    originalPrice,
    stock,
    category,
    file
  } = productData;

  // 🔒 Admin check
  if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  await getCategoryById(category);

  if (!file) {
    throw new Error("No image file provided");
  }

  if (!originalPrice || !price) {
    throw new Error("Price and Original Price are required");
  }

  if (price > originalPrice) {
    throw new Error("Selling price cannot be greater than original price");
  }

  // 🧮 Calculate discount automatically
  let discount = 0;
  if (originalPrice > price) {
    discount = Math.round(((originalPrice - price) / originalPrice) * 100);
  }

  // ☁️ Upload to cloudinary
  const uploadRes = await cloudinary.uploader.upload(file.path);

  // 🗑️ Remove local file
  fs.unlinkSync(file.path);

  // 💾 Save product
  const product = new Product({
    name,
    description,
    price,
    originalPrice,
    discount,
    stock,
    image: uploadRes.secure_url,
    category
  });

  return await product.save();
};


const getAllProducts = async (query,catId) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    sort = "createdAt",
    order = "desc",
  } = query;

  let where = {
    category: catId
  };

  if (search) {
    where.$or = [
      { name: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
    ];
  }

  const total = await Product.countDocuments(where);
  const totalPages = Math.ceil(total / limit);

  const data = await Product.find(where)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ [sort]: order });

  return {
    data,
    total,
    limit: +limit,
    totalPages,
  };
};

const getProductById = async (prodId, catId) => {
  const data = await Product.findOne({
    _id: prodId,
    category: catId,
  });

  if (!data) {
    throw new NotFoundError("Product not found in this category");
  }

  return {data};
};



const updateProduct = async (prodId, prodData, file, adminRole) => {

  // 🔐 Admin check
  if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  const updateObj = {};

  if (prodData.name) updateObj.name = prodData.name;
  if (prodData.description) updateObj.description = prodData.description;
  if (prodData.stock) updateObj.stock = prodData.stock;
  if (prodData.category) updateObj.category = prodData.category;

  // 🧮 Price logic
  let originalPrice = prodData.originalPrice;
  let price = prodData.price;

  if (originalPrice !== undefined) updateObj.originalPrice = originalPrice;
  if (price !== undefined) updateObj.price = price;

  // 🧠 Auto-calc discount if price fields updated
  if (originalPrice && price) {
    if (price > originalPrice) {
      throw new Error("Selling price cannot be greater than original price");
    }

    const discount = Math.round(((originalPrice - price) / originalPrice) * 100);
    updateObj.discount = discount;
  }

  // 🖼️ Image upload
  if (file) {
    const uploadRes = await cloudinary.uploader.upload(file.path);
    fs.unlinkSync(file.path);
    updateObj.image = uploadRes.secure_url;
  }

  const product = await Product.findByIdAndUpdate(
    prodId,
    updateObj,
    { new: true, runValidators: true }
  );

  if (!product) {
    throw new NotFoundError("Product not found");
  }

  return product;
};





const deleteProduct = async (prodId, catId, adminRole) => {
  // 🔐 Admin check
  if (adminRole !== "admin") {
    const error = new Error("Access denied");
    error.statusCode = 403;
    throw error;
  }

  // 🔍 Find and delete product by both _id and category
  const product = await Product.findOneAndDelete({
    _id: prodId,
    category: catId,
  });

  if (!product) {
    throw new NotFoundError(
      `Product not found in category ${catId}`
    );
  }

  return { message: "Product deleted successfully" };
};


export { createProduct, getAllProducts,getProductById, updateProduct, deleteProduct };
