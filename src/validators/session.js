import { body } from "express-validator";
import mongoose from "mongoose";


export const createAuthSessionValidator = [
  body("userId")
    .notEmpty()
    .withMessage("User ID is required")
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage("Invalid User ID"),

  body("refreshToken")
    .notEmpty()
    .withMessage("Refresh token is required"),

  body("expiresAt")
    .notEmpty()
    .withMessage("Expiration date is required")
    .isISO8601()
    .withMessage("Invalid expiration date format"),

  body("ipAddress")
    .optional()
    .isIP()
    .withMessage("Invalid IP address"),

  body("userAgent")
    .optional()
    .isString()
    .withMessage("Invalid user agent"),
];


export const updateAuthSessionValidator = [
  body("isValid")
    .optional()
    .isBoolean()
    .withMessage("isValid must be boolean"),

  body("revokedAt")
    .optional()
    .isISO8601()
    .withMessage("Invalid revokedAt date"),
];
