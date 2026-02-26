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




/**
 * @swagger
 * /flags:
 *   post:
 *     summary: Create a content flag for a message
 *     description: Creates a moderation flag for a specific message. Used to mark harmful or policy-violating AI responses.
 *     tags: [Content Flags]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messageId
 *               - category
 *               - severity
 *             properties:
 *               messageId:
 *                 type: string
 *                 description: ID of the message being flagged
 *                 example: 65f2d1a7c123456789abcd12
 *               category:
 *                 type: string
 *                 enum: [hate, violence, self-harm]
 *                 example: hate
 *               severity:
 *                 type: string
 *                 enum: [low, medium, high]
 *                 example: medium
 *     responses:
 *       201:
 *         description: Content flag created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Content flag created successfully
 *                 data:
 *                   $ref: '#/components/schemas/ContentFlag'
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: Unauthorized – Invalid or missing access token
 *       404:
 *         description: Message not found
 *       500:
 *         description: Internal server error
 */
CONTENT_FLAG_ROUTER.post("/", createContentFlagHandler);



/**
 * @swagger
 * /flags:
 *   get:
 *     summary: Get all content flags (Admin only)
 *     description: Retrieves all flagged messages in the system. Intended for moderation/admin dashboard usage.
 *     tags: [Content Flags]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved all content flags
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ContentFlag'
 *       401:
 *         description: Unauthorized – Invalid or missing access token
 *       403:
 *         description: Forbidden – Only admins can access this resource
 *       500:
 *         description: Internal server error
 */
CONTENT_FLAG_ROUTER.get("/", getAllFlagsHandler);




/**
 * @swagger
 * /flags/{id}:
 *   patch:
 *     summary: Update action taken on a content flag (Admin only)
 *     description: Updates the moderation action for a flagged message. Only "masked" or "blocked" actions are allowed.
 *     tags: [Content Flags]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the content flag
 *         example: 65f4b2c8d4e123456789abcd
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - actionTaken
 *             properties:
 *               actionTaken:
 *                 type: string
 *                 enum: [masked, blocked]
 *                 example: blocked
 *     responses:
 *       200:
 *         description: Flag updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Flag updated successfully
 *                 data:
 *                   $ref: '#/components/schemas/ContentFlag'
 *       400:
 *         description: Invalid action provided
 *       401:
 *         description: Unauthorized – Invalid or missing access token
 *       403:
 *         description: Forbidden – Only admins can update flags
 *       404:
 *         description: Content flag not found
 *       500:
 *         description: Internal server error
 */
CONTENT_FLAG_ROUTER.patch("/:id", updateFlagActionHandler);

export default CONTENT_FLAG_ROUTER;