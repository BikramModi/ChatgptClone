import { body } from "express-validator";

export const createBagaggeValidator = [
  body("name").notEmpty().withMessage("Name is required").trim(),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
];

export const updateBagaggeValidator = [
  body("name").optional().notEmpty().withMessage("Name is required").trim(),
  body("completed")
    .optional()
    .isBoolean()
    .withMessage("Completed must be a boolean"),
];
