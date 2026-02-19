import Message from "../models/message.model.js";
import MessageVersion from "../models/messageversion.model.js";
import Conversation from "../models/conversation.model.js";
import NotFoundError from "../errors/not-found-error.js";



// 🔐 Local Ownership Verification
const verifyConversationOwnership = async (userId, conversationId) => {
  console.log("🔹 Verifying ownership for userId:", userId, "conversationId:", conversationId);

  const conversation = await Conversation.findById(conversationId);
  console.log("✅ Conversation fetched:", conversation);

  if (!conversation) {
    throw new NotFoundError("Conversation not found");
  }

  // Fix: use userId instead of user
  if (conversation.userId.toString() !== userId.toString()) {
    console.log("❌ Ownership mismatch:", conversation.userId.toString(), "!==", userId.toString());
    throw new NotFoundError("You do not have access to this conversation");
  }

  console.log("✅ Ownership verified");
  return conversation;
};

export const getMessageVersionsService = async (userId, messageId) => {
  console.log("🔹 Fetching versions for messageId:", messageId, "for userId:", userId);

  // 1️⃣ Find message
  const message = await Message.findById(messageId);
  console.log("✅ Message fetched:", message);

  if (!message) {
    throw new NotFoundError("Message not found");
  }

  // 2️⃣ Verify ownership
  await verifyConversationOwnership(userId, message.conversationId);

  // 3️⃣ Get versions
  const versions = await MessageVersion.find({ messageId }).sort({ createdAt: -1 });
  console.log("✅ Versions fetched, count:", versions.length);

  return versions;
};

