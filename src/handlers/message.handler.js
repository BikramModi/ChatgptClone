import {
  addMessageService,
  getConversationMessagesService,
  updateMessageService,
  regenerateMessageService,
} from "../services/message.service.js";

import Router  from "express";


const MESSAGE_ROUTER = Router();




/**
 * POST /conversations/:id/messages
 */
export const addMessageHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;
    const { content } = req.body;

    await addMessageService(
      userId,
      conversationId,
      content,
      res
    );

  } catch (error) {
    next(error);
  }
};



/**
 * GET /conversations/:id/messages
 */
export const getConversationMessagesHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const conversationId = req.params.id;

    const messages = await getConversationMessagesService(
      userId,
      conversationId
    );

    res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * PATCH /messages/:id
 */
export const updateMessageHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const messageId = req.params.id;
    const { content } = req.body;

    const updatedMessage = await updateMessageService(
      userId,
      messageId,
      content
    );

    res.status(200).json({
      success: true,
      data: updatedMessage,
    });
  } catch (error) {
    next(error);
  }
};


/**
 * POST /messages/:id/regenerate
 */
// export const regenerateMessageHandler = async (req, res, next) => {
//   try {
//     const userId = req.user.userId;
//     const messageId = req.params.id;

//     // Call regenerate service (non-stream)
//     const updatedAssistantMessage = await regenerateMessageService(
//       userId,
//       messageId
//     );

//     // Return JSON to frontend
//     res.status(200).json({
//       success: true,
//       message: "Assistant message regenerated successfully",
//       data: updatedAssistantMessage,
//     });
//   } catch (error) {
//     next(error);
//   }
// };


export const regenerateMessageHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const messageId = req.params.id;

    await regenerateMessageService(userId, messageId, res);
  } catch (error) {
    next(error);
  }
};



MESSAGE_ROUTER.post("/conversations/:id/messages", addMessageHandler);
MESSAGE_ROUTER.get("/conversations/:id/messages", getConversationMessagesHandler);
MESSAGE_ROUTER.patch("/messages/:id", updateMessageHandler);
MESSAGE_ROUTER.post("/messages/:id/regenerate", regenerateMessageHandler);

export default MESSAGE_ROUTER;