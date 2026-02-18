import UnauthorizedError from "../errors/unauthorized-error.js";
import Conversation from "../models/conversation.model.js";


/**
 * Create Conversation
 */
export const createConversationService = async (userId, data) => {
  const conversation = await Conversation.create({
    userId: userId,
    title: data.title || "New Chat",
    model: data.model || "gpt-3.5",
    systemPrompt: data.systemPrompt || "",
    visibility: data.visibility || "private",
  });

  return conversation;
};


/**
 * Get All Conversations (not archived)
 */
export const getUserConversationsService = async (userId) => {
  const conversations = await Conversation.find({
    userId: userId,
    isArchived: false,
  }).sort({ updatedAt: -1 });

  return conversations;
};


/**
 * Get Single Conversation
 */
export const getSingleConversationService = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: userId,
  });

  if (!conversation) {
    throw new UnauthorizedError("Conversation not found");
  }

  return conversation;
};


/**
 * Update Conversation (rename, archive, visibility, model, systemPrompt)
 */
export const updateConversationService = async (
  userId,
  conversationId,
  data
) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: userId,
  });

  if (!conversation) {
    throw new UnauthorizedError("Conversation not found");
  }

  if (data.title !== undefined) {
    conversation.title = data.title;
  }

  if (data.model !== undefined) {
    conversation.model = data.model;
  }

  if (data.systemPrompt !== undefined) {
    conversation.systemPrompt = data.systemPrompt;
  }

  if (data.visibility !== undefined) {
    conversation.visibility = data.visibility;
  }

  if (data.isArchived !== undefined) {
    conversation.isArchived = data.isArchived;
  }

  await conversation.save();

  return conversation;
};


/**
 * Soft Delete (archive)
 */
export const deleteConversationService = async (userId, conversationId) => {
  const conversation = await Conversation.findOne({
    _id: conversationId,
    userId: userId,
  });

  if (!conversation) {
    throw new UnauthorizedError("Conversation not found");
  }

  conversation.isArchived = true;

  await conversation.save();

  return conversation;
};
