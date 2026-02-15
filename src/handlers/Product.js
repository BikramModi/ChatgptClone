import {Router} from "express";
import upload from "../utils/multer.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "../services/Product.js";

import {
  createUserValidator,
  updateUserValidator,
} from "../validators/user.js";

import useValidator from "../middlewares/useValidator.js"

const PRODUCT_ROUTER = Router({mergeParams: true});



// CREATE PRODUCT
PRODUCT_ROUTER.post(
  "/",
  
  upload.single("image"),
  async (req, res, next) => {
    try {
      const product = await createProduct(
        {
          ...req.body,
          category: req.params.catId,
          file: req.file
        },
        req.user.role
      );

      res.status(201).json({
        success: true,
        message: "Product created successfully",
        product
      });

    } catch (error) {
      next(error);
    }
  }
);



PRODUCT_ROUTER.get("/", async (req, res, next) => {
  try {
    const products = await getAllProducts(req.query,req.params.catId);
    res.status(200).json(products);
  } catch (error) {
    next(error);
  }
});

PRODUCT_ROUTER.get("/:id", async (req, res, next) => {
  try {
    const product = await getProductById(req.params.id,req.params.catId);
    res.status(200).json(product);
  } catch (error) {
    next(error);
  }
});



PRODUCT_ROUTER.patch(
  "/:id",
  upload.single("image"),
  async (req, res, next) => {
    try {
      const product = await updateProduct(
        req.params.id,
        req.body,
        req.file,
        req.user.role
      );
      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        product
      });
    } catch (error) {
      next(error);
    }
  }
);




PRODUCT_ROUTER.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteProduct(req.params.id, req.params.catId, req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});


export default PRODUCT_ROUTER;
