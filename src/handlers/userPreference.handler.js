// controllers/preferences.controller.js

import {
  getPreferencesService,
  updatePreferencesService,
} from "../services/userPreference.service.js";

import  Router  from "express";




const PREFERENCE_ROUTER = Router();


/**
 * @swagger
 * /preferences/get:
 *   get:
 *     summary: Get current user's preferences
 *     tags: [Preferences]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: User preferences fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserPreference'
 */

PREFERENCE_ROUTER.get("/get", async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const preferences = await getPreferencesService(userId);

    res.status(200).json({
        success: true,
        data: preferences,
    });
  } catch (error) {
    next(error);
  }
});




/**
 * @swagger
 * /preferences/update:
 *   patch:
 *     summary: Update user preferences
 *     tags: [Preferences]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               defaultModel:
 *                 type: string
 *               temperature:
 *                 type: number
 *               tone:
 *                 type: string
 *                 enum: [formal, casual]
 *               theme:
 *                 type: string
 *                 enum: [light, dark]
 *     responses:
 *       200:
 *         description: Preferences updated successfully
 */

PREFERENCE_ROUTER.patch("/update", async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const updatedPreferences = await updatePreferencesService(
      userId,
      req.body
    );

    res.status(200).json({
        success: true,
        message: "Preferences updated",
        data: updatedPreferences,
    });
  } catch (error) {
    next(error);
  }
});

export default PREFERENCE_ROUTER;






