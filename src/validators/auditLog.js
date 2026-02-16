import { body } from "express-validator";
import mongoose from "mongoose";

export const createAuditLogValidator = [
  body("actorId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid actorId"),

  body("action")
    .trim()
    .notEmpty()
    .withMessage("Action is required")
    .isLength({ max: 100 })
    .withMessage("Action must not exceed 100 characters"),

  body("entity")
    .trim()
    .notEmpty()
    .withMessage("Entity is required")
    .isLength({ max: 100 })
    .withMessage("Entity must not exceed 100 characters"),

  body("entityId")
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid entityId"),

  body("metadata")
    .optional()
    .isObject()
    .withMessage("Metadata must be a valid object"),
];
