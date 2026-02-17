// services/preferences.service.js

import UserPreference from "../models/userpreference.model.js";

/**
 * Get Preferences
 */
export const getPreferencesService = async (userId) => {
  let preferences = await UserPreference.findOne({ userId: userId });

  // If not found → create default
  if (!preferences) {
    preferences = await UserPreference.create({
      userId: userId,
      defaultModel: "gpt-3.5",
      temperature: 0.7,
      theme: "light",
    });
  }

  return preferences;
};


/**
 * Update Preferences
 */
export const updatePreferencesService = async (userId, data) => {
  let preferences = await UserPreference.findOne({ userId: userId });

  // If not found → create first
  if (!preferences) {
    preferences = await UserPreference.create({
      userId: userId,
      defaultModel: "gpt-3.5",
      temperature: 0.7,
      theme: "light",
    });
  }

  // Simple direct updates
  if (data.defaultModel !== undefined) {
    preferences.defaultModel = data.defaultModel;
  }

  if (data.temperature !== undefined) {
    preferences.temperature = data.temperature;
  }

  if (data.theme !== undefined) {
    preferences.theme = data.theme;
  }

  await preferences.save();

  return preferences;
};
