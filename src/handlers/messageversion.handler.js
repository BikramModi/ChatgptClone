import { getMessageVersionsService } from "../services/messageversion.service.js";
import Router from "express";

const MESSAGE_VERSION_ROUTER = Router();






export const getMessageVersionsHandler = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const messageId = req.params.id;
    const conId = req.params.conversationId;

    const versions = await getMessageVersionsService(
      userId,
      messageId,
      conId
    );

    res.json({
      success: true,
      versions,
    });

  } catch (err) {
    next(err);
  }
};



MESSAGE_VERSION_ROUTER.get("/:conversationId/:id/versions", getMessageVersionsHandler);

export default MESSAGE_VERSION_ROUTER;