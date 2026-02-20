import ContentFlag from "../models/contentflag.model.js";
import Message from "../models/message.model.js";
import NotFoundError from "../errors/not-found-error.js";

/**
 * 🔹 Create flag automatically (system or AI moderation)
 */
export const createContentFlagService = async (
  messageId,
  category,
  severity
) => {
  console.log("🚩 Creating content flag for message:", messageId);

  const message = await Message.findById(messageId);
  if (!message) {
    throw new NotFoundError("Message not found");
  }

  const flag = await ContentFlag.create({
    messageId,
    category,
    severity,
  });

  console.log("✅ Flag created:", flag._id);
  return flag;
};

/**
 * 🔹 Admin: Get all flagged content
 */
export const getAllFlagsService = async () => {
  console.log("📋 Fetching all content flags");

  const flags = await ContentFlag.find()
    .populate("messageId")
    .sort({ createdAt: -1 });

  console.log("✅ Flags fetched:", flags.length);
  return flags;
};

/**
 * 🔹 Admin: Take action (mask / block)
 */
export const updateFlagActionService = async (flagId, action) => {
  console.log("⚙️ Updating flag action:", flagId);

  const flag = await ContentFlag.findById(flagId);
  if (!flag) {
    throw new NotFoundError("Flag not found");
  }

  flag.actionTaken = action;
  await flag.save();

  // Optional: apply action to message
  if (action === "masked") {
    await Message.findByIdAndUpdate(flag.messageId, {
      content: "⚠️ This message has been masked due to policy violation.",
    });
  }

  if (action === "blocked") {
    await Message.findByIdAndUpdate(flag.messageId, {
      content: "🚫 This message has been blocked by admin.",
      status: "failed",
    });
  }

  console.log("✅ Flag updated");
  return flag;
};
