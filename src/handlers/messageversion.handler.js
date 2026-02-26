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




/**
 * @swagger
 * /messagesvr/{conversationId}/{id}/versions:
 *   get:
 *     summary: Get all versions of a message
 *     description: Returns all regenerated versions of a specific message within a conversation. Only the owner of the conversation can access message versions.
 *     tags: [MessageVersions]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: conversationId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the conversation
 *         example: 65f2c8b5d4e123456789abcd
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the original message
 *         example: 65f2d1a7c123456789abcd12
 *     responses:
 *       200:
 *         description: Successfully retrieved message versions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 versions:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/MessageVersion'
 *       401:
 *         description: Unauthorized – Invalid or missing access token
 *       403:
 *         description: Forbidden – User does not own this conversation
 *       404:
 *         description: Message or conversation not found
 *       500:
 *         description: Internal server error
 */
MESSAGE_VERSION_ROUTER.get("/:conversationId/:id/versions", getMessageVersionsHandler);

export default MESSAGE_VERSION_ROUTER;