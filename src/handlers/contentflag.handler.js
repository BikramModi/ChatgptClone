import {
  getAllFlagsService,
  updateFlagActionService,
} from "../services/contentflag.service.js";

import { Router } from "express";

const CONTENT_FLAG_ROUTER = Router();



import {
  createContentFlagService,
} from "../services/contentflag.service.js";

/**
 * 🔹 POST /flags
 * Used when:
 * - AI moderation flags content
 * - User manually reports a message
 */
export const createContentFlagHandler = async (req, res, next) => {
  try {
    const { messageId, category, severity } = req.body;

    console.log("🚩 Creating content flag:", {
      messageId,
      category,
      severity,
    });

    // Basic validation
    // if (!messageId || !category || !severity) {
    //   return res.status(400).json({
    //     success: false,
    //     message: "messageId, category and severity are required",
    //   });
    // }

    const flag = await createContentFlagService(
      messageId,
      category,
      severity
    );

    res.status(201).json({
      success: true,
      message: "Content flag created successfully",
      data: flag,
    });
  } catch (error) {
    next(error);
  }
};




/**
 * 🔹 GET /flags (Admin)
 */
export const getAllFlagsHandler = async (req, res, next) => {
  try {
    const flags = await getAllFlagsService();

    res.status(200).json({
      success: true,
      data: flags,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔹 PATCH /flags/:id (Admin takes action)
 */
export const updateFlagActionHandler = async (req, res, next) => {
  try {
    const { actionTaken } = req.body;

    if (!["masked", "blocked"].includes(actionTaken)) {
      return res.status(400).json({
        success: false,
        message: "Invalid action",
      });
    }

    const updatedFlag = await updateFlagActionService(
      req.params.id,
      actionTaken
    );

    res.status(200).json({
      success: true,
      message: "Flag updated successfully",
      data: updatedFlag,
    });
  } catch (error) {
    next(error);
  }
};



CONTENT_FLAG_ROUTER.post("/", createContentFlagHandler);
CONTENT_FLAG_ROUTER.get("/", getAllFlagsHandler);
CONTENT_FLAG_ROUTER.patch("/:id", updateFlagActionHandler);

export default CONTENT_FLAG_ROUTER;