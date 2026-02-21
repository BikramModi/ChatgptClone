import UsageMetric from "../models/usagemetric.model.js";
import  NotFoundError  from "../errors/not-found-error.js";
import UnauthorizedError from "../errors/unauthorized-error.js";



//create or update usage metric for a user by system or ai moderation

// Get start + end of current month
const getCurrentMonthPeriod = () => {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  return { periodStart, periodEnd };
};

export const updateUsageMetric = async (
  userId,
  tokensUsed,
  cost = 0
) => {
  const { periodStart, periodEnd } = getCurrentMonthPeriod();

  await UsageMetric.findOneAndUpdate(
    {
      userId,
      periodStart,
      periodEnd,
    },
    {
      $inc: {
        totalMessages: 1,
        totalTokens: tokensUsed,
        totalCost: cost,
      },
    },
    { upsert: true, new: true }
  );
};


//place after user message saved
// Check if user has exceeded free plan limit

const FREE_PLAN_LIMIT = 3000; // tokens per month

export const checkUsageLimit = async (userId) => {
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const usage = await UsageMetric.findOne({
    userId,
    periodStart,
    periodEnd,
  });

  if (!usage) return; // first usage

  if (usage.totalTokens >= FREE_PLAN_LIMIT) {
    throw new UnauthorizedError("Monthly usage limit exceeded. Upgrade your plan.");
  }
};



//place after assistant message saved
// Get current user's usage
export const getUserUsageService = async (userId) => {
  const usage = await UsageMetric.find({ userId }).sort({ periodStart: -1 });

  if (!usage.length) {
    throw new NotFoundError("No usage data found");
  }

  return usage;
};

// Admin: get all usage
export const getAllUsageService = async () => {
  const usage = await UsageMetric.find()
    .populate("userId", "name email")
    .sort({ periodStart: -1 });

  return usage;
};
