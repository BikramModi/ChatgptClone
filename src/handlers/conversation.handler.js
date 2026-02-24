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



/**
 * @swagger
 * /conversations:
 *   post:
 *     summary: Create a new conversation
 *     description: Creates a new conversation for the authenticated user.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateConversationRequest'
 *     responses:
 *       201:
 *         description: Conversation created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */

CONVERSATION_ROUTER.post("/", createConversationHandler);



/**
 * @swagger
 * /conversations:
 *   get:
 *     summary: Get all conversations for the authenticated user
 *     description: Returns all conversations that belong to the currently authenticated user.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Conversation'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
CONVERSATION_ROUTER.get("/", getUserConversationsHandler);




/**
 * @swagger
 * /conversations/{id}:
 *   get:
 *     summary: Get a single conversation by ID
 *     description: Returns a specific conversation that belongs to the authenticated user.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 65f2c8b5d4e123456789abcd
 *         description: MongoDB ObjectId of the conversation
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Invalid conversation ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not owner of conversation
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
CONVERSATION_ROUTER.get("/:id", getSingleConversationHandler);



/**
 * @swagger
 * /conversations/{id}:
 *   patch:
 *     summary: Update a conversation
 *     description: Updates a conversation that belongs to the authenticated user.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 65f2c8b5d4e123456789abcd
 *         description: MongoDB ObjectId of the conversation
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateConversationRequest'
 *     responses:
 *       200:
 *         description: Conversation updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Conversation'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not owner of conversation
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */

CONVERSATION_ROUTER.patch("/:id", updateConversationHandler);




/**
 * @swagger
 * /conversations/{id}:
 *   delete:
 *     summary: Archive a conversation
 *     description: >
 *       Archives (soft deletes) a conversation that belongs to the authenticated user.
 *       The conversation is not permanently deleted but marked as archived.
 *     tags: [Conversations]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           example: 65f2c8b5d4e123456789abcd
 *         description: MongoDB ObjectId of the conversation
 *     responses:
 *       200:
 *         description: Conversation archived successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Conversation archived successfully
 *       400:
 *         description: Invalid conversation ID format
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Not owner of conversation
 *       404:
 *         description: Conversation not found
 *       500:
 *         description: Internal server error
 */
CONVERSATION_ROUTER.delete("/:id", deleteConversationHandler);

export default CONVERSATION_ROUTER;