import Router from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
} from "../services/Category.js";

import {
  createUserValidator,
  updateUserValidator,
} from "../validators/user.js";

import useValidator from "../middlewares/useValidator.js";

const CATEGORY_ROUTER = Router();

CATEGORY_ROUTER.post(
  "/",
  
  async (req, res, next) => {
    try {
      const category = await createCategory(req.body, req.user.role);
      res.status(201).json(category);
    } catch (error) {
      next(error);
    }
  }
);

CATEGORY_ROUTER.get("/", async (req, res, next) => {
  try {
    const categories = await getAllCategories(req.query);
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
});

CATEGORY_ROUTER.get("/:id", async (req, res, next) => {
  try {
    const category = await getCategoryById(req.params.id);
    res.status(200).json(category);
  } catch (error) {
    next(error);
  }
});

CATEGORY_ROUTER.patch(
  "/:id",
  
  async (req, res, next) => {
    try {
      const category = await updateCategory(req.params.id, req.body, req.user.role);
      res.status(200).json(category);
    } catch (error) {
      next(error);
    }
  }
);

CATEGORY_ROUTER.delete("/:id", async (req, res, next) => {
  try {
    const result = await deleteCategory(req.params.id,req.user.role);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default CATEGORY_ROUTER;
