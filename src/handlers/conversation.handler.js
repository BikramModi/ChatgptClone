import {
  createConversationService,
  getUserConversationsService,
  getSingleConversationService,
  updateConversationService,
  deleteConversationService,
} from "../services/conversation.service.js";

import  Router  from "express";



const CONVERSATION_ROUTER = Router();




export const createConversationHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const conversation = await createConversationService(userId, req.body);

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};


export const getUserConversationsHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;

    const conversations = await getUserConversationsService(userId);

    res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (error) {
    next(error);
  }
};


export const getSingleConversationHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    const conversation = await getSingleConversationService(
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      data: conversation,
    });
  } catch (error) {
    next(error);
  }
};


export const updateConversationHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    const updatedConversation = await updateConversationService(
      userId,
      conversationId,
      req.body
    );

    res.status(200).json({
      success: true,
      data: updatedConversation,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteConversationHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    await deleteConversationService(userId, conversationId);

    res.status(200).json({
      success: true,
      message: "Conversation archived successfully",
    });
  } catch (error) {
    next(error);
  }
};



CONVERSATION_ROUTER.post("/", createConversationHandler);
CONVERSATION_ROUTER.get("/", getUserConversationsHandler);
CONVERSATION_ROUTER.get("/:id", getSingleConversationHandler);
CONVERSATION_ROUTER.patch("/:id", updateConversationHandler);
CONVERSATION_ROUTER.delete("/:id", deleteConversationHandler);

export default CONVERSATION_ROUTER;