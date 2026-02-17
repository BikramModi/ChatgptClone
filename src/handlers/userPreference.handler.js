// controllers/preferences.controller.js

import {
  getPreferencesService,
  updatePreferencesService,
} from "../services/userPreference.service.js";

import  Router  from "express";




const PREFERENCE_ROUTER = Router();



/**
 * GET /preferences
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
 * PATCH /preferences
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






