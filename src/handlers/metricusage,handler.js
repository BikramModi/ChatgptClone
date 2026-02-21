import {
  getUserUsageService,
  getAllUsageService,
} from "../services/usagemetric.service.js";

import Router from "express";

const METRIC_ROUTER = Router();




export const getUserUsageHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const usage = await getUserUsageService(userId);

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsageHandler = async (req, res, next) => {
  try {
    const usage = await getAllUsageService();

    res.status(200).json({
      success: true,
      data: usage,
    });
  } catch (error) {
    next(error);
  }
};



METRIC_ROUTER.get("/usage", getUserUsageHandler);
METRIC_ROUTER.get("/usage/all", getAllUsageHandler);

export default METRIC_ROUTER;