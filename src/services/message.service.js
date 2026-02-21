


import mongoose from "mongoose";
import fetch from "node-fetch";

import Message from "../models/message.model.js";
import MessageVersion from "../models/messageversion.model.js";
import Conversation from "../models/conversation.model.js";
import axios from "axios";
import NotFoundError from "../errors/not-found-error.js";
import UnauthorizedError from "../errors/unauthorized-error.js";

import { createContentFlagService } from "./contentflag.service.js";

import { updateUsageMetric } from "./usagemetric.service.js";

import { checkUsageLimit } from "./usagemetric.service.js";


/* -------------------------------------------------- */
/* VERIFY OWNERSHIP */
/* -------------------------------------------------- */

const verifyConversationOwnership = async (userId, conversationId) => {

    console.log("Verifying ownership for userId:", userId, "conversationId:", conversationId);

    const conversation = await Conversation.findOne({
        _id: conversationId,
        userId,
    });

    if (!conversation) {
        throw new NotFoundError("Conversation not found");
    }

    return conversation;
};


/* -------------------------------------------------- */
/* BUILD FULL CONVERSATION CONTEXT */
/* -------------------------------------------------- */

const buildConversationHistory = async (conversationId) => {
    const messages = await Message.find({ conversationId })
        .sort({ createdAt: 1 });

    return messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
    }));
};


/* -------------------------------------------------- */
/* TOKEN ESTIMATION (simple approx) */
/* -------------------------------------------------- */

const estimateTokens = (text) => {
    return Math.ceil(text.length / 4); // simple rough estimate
};


/* -------------------------------------------------- */
/* ADD MESSAGE + STREAM AI RESPONSE */
/* -------------------------------------------------- */

// export const addMessageService = async (
//   userId,
//   conversationId,
//   content,
//   res
// ) => {
//   const conversation = await verifyConversationOwnership(
//     userId,
//     conversationId
//   );

//   // Save user message
//   await Message.create({
//     conversationId,
//     role: "user",
//     content,
//     tokenCount: estimateTokens(content),
//   });

//   // Build conversation history
//   let history = await buildConversationHistory(conversationId);

//   if (conversation.systemPrompt) {
//     history.unshift({
//       role: "system",
//       content: conversation.systemPrompt,
//     });
//   }

//   // Setup streaming headers
//   res.setHeader("Content-Type", "text/event-stream");
//   res.setHeader("Cache-Control", "no-cache");
//   res.setHeader("Connection", "keep-alive");

//   const startTime = Date.now();
//   let fullResponse = "";

//   try {
//     const response = await fetch(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//           "HTTP-Referer": "http://localhost:3000",
//           "X-Title": "MERN ChatBot",
//         },
//         body: JSON.stringify({
//           model: conversation.model || "mistralai/devstral-small",
//           messages: history,
//           stream: true,
//         }),
//       }
//     );

//     if (!response.body) {
//       throw new Error("No response body from OpenRouter");
//     }

//     response.body.on("data", (chunk) => {
//       const lines = chunk.toString().split("\n").filter(Boolean);

//       for (const line of lines) {
//         if (!line.startsWith("data:")) continue;

//         const data = line.replace("data: ", "");

//         if (data === "[DONE]") return;

//         try {
//           const parsed = JSON.parse(data);

//           const token =
//             parsed?.choices?.[0]?.delta?.content ||
//             parsed?.choices?.[0]?.message?.content;

//           if (token) {
//             fullResponse += token;
//             res.write(`data: ${token}\n\n`);
//           }
//         } catch (err) {
//           // ignore malformed JSON chunks
//         }
//       }
//     });

//     response.body.on("end", async () => {
//       await finalizeResponse(
//         fullResponse,
//         history,
//         conversation,
//         conversationId,
//         startTime,
//         res
//       );
//     });

//     response.body.on("error", async (err) => {
//       console.error("Stream error:", err);

//       await finalizeResponse(
//         fullResponse,
//         history,
//         conversation,
//         conversationId,
//         startTime,
//         res
//       );
//     });

//   } catch (error) {
//     console.error("Streaming failed:", error);

//     await finalizeResponse(
//       fullResponse,
//       history,
//       conversation,
//       conversationId,
//       startTime,
//       res
//     );
//   }
// };


// export const addMessageService = async (
//   userId,
//   conversationId,
//   content,
//   res,
//   options = {}
// ) => {

//   const { skipUserMessage = false } = options;

//   const conversation = await verifyConversationOwnership(
//     userId,
//     conversationId
//   );

//   // ✅ Only create user message if not skipping (normal chat)
//   if (!skipUserMessage) {
//     await Message.create({
//       conversationId,
//       role: "user",
//       content,
//       tokenCount: estimateTokens(content),
//     });
//   }

//   let history = await buildConversationHistory(conversationId);

//   if (conversation.systemPrompt) {
//     history.unshift({
//       role: "system",
//       content: conversation.systemPrompt,
//     });
//   }

//   const isStreaming = !!res;

//   if (isStreaming) {
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");
//   }

//   const startTime = Date.now();
//   let fullResponse = "";

//   const response = await fetch(
//     "https://openrouter.ai/api/v1/chat/completions",
//     {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//         "HTTP-Referer": "http://localhost:3000",
//         "X-Title": "MERN ChatBot",
//       },
//       body: JSON.stringify({
//         model: conversation.model || "mistralai/devstral-small",
//         messages: history,
//         stream: true,
//       }),
//     }
//   );

//   if (!response.body) {
//     throw new Error("No response body from OpenRouter");
//   }

//   return new Promise((resolve, reject) => {

//     response.body.on("data", (chunk) => {
//       const lines = chunk.toString().split("\n").filter(Boolean);

//       for (const line of lines) {
//         if (!line.startsWith("data:")) continue;

//         const data = line.replace("data: ", "");

//         if (data === "[DONE]") return;

//         try {
//           const parsed = JSON.parse(data);

//           const token =
//             parsed?.choices?.[0]?.delta?.content ||
//             parsed?.choices?.[0]?.message?.content;

//           if (token) {
//             fullResponse += token;

//             if (isStreaming) {
//               res.write(`data: ${token}\n\n`);
//             }
//           }
//         } catch {}
//       }
//     });

//     response.body.on("end", async () => {

//       const assistantMessage = await finalizeResponse(
//         fullResponse,
//         history,
//         conversation,
//         conversationId,
//         startTime,
//         isStreaming ? res : null
//       );

//       resolve(assistantMessage);
//     });

//     response.body.on("error", reject);
//   });
// };


// export const addMessageService = async (userId, conversationId, content, res = null) => {
//   const conversation = await verifyConversationOwnership(userId, conversationId);

//   // Save user message
//   await Message.create({
//     conversationId,
//     role: "user",
//     content,
//     tokenCount: estimateTokens(content),
//   });

//   // Build conversation history
//   let history = await buildConversationHistory(conversationId);
//   if (conversation.systemPrompt) {
//     history.unshift({ role: "system", content: conversation.systemPrompt });
//   }

//   // Streaming mode
//   if (res) {
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     let fullResponse = "";
//     const startTime = Date.now();

//     try {
//       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//           "X-Title": "MERN ChatBot",
//         },
//         body: JSON.stringify({
//           model: conversation.model || "mistralai/devstral-small",
//           messages: history,
//           stream: true,
//         }),
//       });

//       if (!response.body) throw new Error("No response body from OpenRouter");

//       // Streaming
//       for await (const chunk of response.body) {
//         const lines = chunk.toString().split("\n").filter(Boolean);
//         for (const line of lines) {
//           if (!line.startsWith("data:")) continue;
//           const data = line.replace("data: ", "");
//           if (data === "[DONE]") break;

//           try {
//             const parsed = JSON.parse(data);
//             const token =
//               parsed?.choices?.[0]?.delta?.content ||
//               parsed?.choices?.[0]?.message?.content;

//             if (token) {
//               fullResponse += token;
//               res.write(`data: ${token}\n\n`);
//             }
//           } catch (err) {}
//         }
//       }

//       // finalize
//       return await finalizeResponse(fullResponse, history, conversation, conversationId, startTime, res);

//     } catch (err) {
//       console.error("Streaming failed:", err);
//       return await finalizeResponse("", history, conversation, conversationId, startTime, res);
//     }
//   }

//   // Non-stream mode
//   else {
//     // Full response fetch
//     const startTime = Date.now();
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: conversation.model || "mistralai/devstral-small",
//         messages: history,
//       }),
//     });
//     const data = await response.json();
//     const fullResponse = data?.choices?.[0]?.message?.content || "";

//     return await finalizeResponse(fullResponse, history, conversation, conversationId, startTime, null);
//   }
// };


// export const addMessageService = async (
//   userId,
//   conversationId,
//   content,
//   res = null,
//   options = {}
// ) => {
//   const { skipUserMessage = false } = options;

//   const conversation = await verifyConversationOwnership(userId, conversationId);

//   // Save user message (skip if regenerating assistant)
//   if (!skipUserMessage) {
//     await Message.create({
//       conversationId,
//       role: "user",
//       content,
//       tokenCount: estimateTokens(content),
//     });
//   }

//   // Build conversation history
//   let history = await buildConversationHistory(conversationId);
//   if (conversation.systemPrompt) {
//     history.unshift({ role: "system", content: conversation.systemPrompt });
//   }

//   // Streaming mode
//   if (res) {
//     res.setHeader("Content-Type", "text/event-stream");
//     res.setHeader("Cache-Control", "no-cache");
//     res.setHeader("Connection", "keep-alive");

//     let fullResponse = "";
//     const startTime = Date.now();

//     try {
//       const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//         method: "POST",
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "Content-Type": "application/json",
//           "X-Title": "MERN ChatBot",
//         },
//         body: JSON.stringify({
//           model: conversation.model || "mistralai/devstral-small",
//           messages: history,
//           stream: true,
//         }),
//       });

//       if (!response.body) throw new Error("No response body from OpenRouter");

//       for await (const chunk of response.body) {
//         const lines = chunk.toString().split("\n").filter(Boolean);
//         for (const line of lines) {
//           if (!line.startsWith("data:")) continue;
//           const data = line.replace("data: ", "");
//           if (data === "[DONE]") break;

//           try {
//             const parsed = JSON.parse(data);
//             const token =
//               parsed?.choices?.[0]?.delta?.content ||
//               parsed?.choices?.[0]?.message?.content;

//             if (token) {
//               fullResponse += token;
//               res.write(`data: ${token}\n\n`);
//             }
//           } catch (err) {}
//         }
//       }

//       return await finalizeResponse(fullResponse, history, conversation, conversationId, startTime, res);

//     } catch (err) {
//       console.error("Streaming failed:", err);
//       return await finalizeResponse("", history, conversation, conversationId, startTime, res);
//     }
//   }

//   // Non-stream mode
//   const startTime = Date.now();
//   const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//     method: "POST",
//     headers: {
//       Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//       "Content-Type": "application/json",
//     },
//     body: JSON.stringify({
//       model: conversation.model || "mistralai/devstral-small",
//       messages: history,
//     }),
//   });
//   const data = await response.json();
//   const fullResponse = data?.choices?.[0]?.message?.content || "";

//   return await finalizeResponse(fullResponse, history, conversation, conversationId, startTime, null);
// };



export const moderateContent = (text) => {
    const lower = text.toLowerCase();

    const hateWords = ["racist", "kill all", "nazi"];
    const violenceWords = ["bomb", "shoot", "attack"];
    const selfHarmWords = ["suicide", "kill myself", "self harm"];

    if (hateWords.some(word => lower.includes(word))) {
        return { category: "hate", severity: "high" };
    }

    if (violenceWords.some(word => lower.includes(word))) {
        return { category: "violence", severity: "medium" };
    }

    if (selfHarmWords.some(word => lower.includes(word))) {
        return { category: "self-harm", severity: "high" };
    }

    return null;
};



export const addMessageService = async (
    userId,
    conversationId,
    content,
    res = null,
    options = {}
) => {
    const { skipUserMessage = false } = options;

    const conversation = await verifyConversationOwnership(userId, conversationId);

    // Save user message (skip if regenerating assistant)
    //   if (!skipUserMessage) {
    //     await Message.create({
    //       conversationId,
    //       role: "user",
    //       content,
    //       tokenCount: estimateTokens(content),
    //     });
    //   }


    // 🛡️ Moderate USER message first
    if (!skipUserMessage) {
        const moderationResult = moderateContent(content);

        if (moderationResult) {
            console.log("🚩 User message flagged:", moderationResult);

            // Save flagged message (optional but recommended for audit)
            const flaggedMessage = await Message.create({
                conversationId,
                role: "user",
                content,
                tokenCount: estimateTokens(content),

            });

            // Create ContentFlag entry
            await createContentFlagService(
                flaggedMessage._id,
                moderationResult.category,
                moderationResult.severity
            );

            // ❌ Stop AI generation
            throw new UnauthorizedError("Your message violates content policy.");
        }

        // ✅ Safe → Save normally
        await Message.create({
            conversationId,
            role: "user",
            content,
            tokenCount: estimateTokens(content),
        });


        await checkUsageLimit(userId);



    }






    // Build conversation history
    let history = await buildConversationHistory(conversationId);
    if (conversation.systemPrompt) {
        history.unshift({ role: "system", content: conversation.systemPrompt });
    }

    const startTime = Date.now();

    // STREAMING mode
    if (res) {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        let fullResponse = "";

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json",
                    "X-Title": "MERN ChatBot",
                },
                body: JSON.stringify({
                    model: conversation.model || "mistralai/devstral-small",
                    messages: history,
                    stream: true,
                }),
            });

            if (!response.body) throw new Error("No response body from OpenRouter");

            for await (const chunk of response.body) {
                const lines = chunk.toString().split("\n").filter(Boolean);
                for (const line of lines) {
                    if (!line.startsWith("data:")) continue;
                    const data = line.replace("data: ", "");
                    if (data === "[DONE]") break;

                    try {
                        const parsed = JSON.parse(data);
                        const token =
                            parsed?.choices?.[0]?.delta?.content ||
                            parsed?.choices?.[0]?.message?.content;

                        if (token) {
                            fullResponse += token;
                            res.write(`data: ${token}\n\n`);
                        }
                    } catch (err) { }
                }
            }

            // Save assistant message after streaming
            const latency = Date.now() - startTime;
            await Message.create({
                conversationId,
                role: "assistant",
                content: fullResponse,
                tokenCount: estimateTokens(fullResponse),
                latencyMs: latency,
                status: "completed",
            });



            //calculate cost
            const totalTokens = estimateTokens(fullResponse);
            const costPer1k = 0.002;
            const cost = (totalTokens / 1000) * costPer1k;



            // 🔥 CALL USAGE UPDATE RIGHT HERE
            await updateUsageMetric(
                userId,
                estimateTokens(fullResponse),
                cost
            );



            await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

            res.write(`data: [DONE]\n\n`);
            res.end();

            return fullResponse; // return AI text
        } catch (err) {
            console.error("Streaming failed:", err);
            res.write(`data: [DONE]\n\n`);
            res.end();
            return ""; // fallback
        }
    }

    // NON-STREAM mode
    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: conversation.model || "mistralai/devstral-small",
                messages: history,
            }),
        });

        const data = await response.json();
        const fullResponse = data?.choices?.[0]?.message?.content || "⚠️ AI returned empty response";

        // Save assistant message
        const latency = Date.now() - startTime;
        await Message.create({
            conversationId,
            role: "assistant",
            content: fullResponse,
            tokenCount: estimateTokens(fullResponse),
            latencyMs: latency,
            status: "completed",
        });




        const totalTokens = estimateTokens(fullResponse);
        const costPer1k = 0.002;
        const cost = (totalTokens / 1000) * costPer1k;



        // 🔥 CALL USAGE UPDATE RIGHT HERE
        await updateUsageMetric(
            userId,
            estimateTokens(fullResponse),
            cost
        );



        await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

        return fullResponse; // ✅ return AI content for regeneration
    } catch (err) {
        console.error("Non-stream AI fetch failed:", err);
        throw new Error("Failed to generate AI response");
    }
};



/* ===================================================== */
/* FINALIZE RESPONSE (SAFE FALLBACK) */
/* ===================================================== */

// const finalizeResponse = async (
//   fullResponse,
//   history,
//   conversation,
//   conversationId,
//   startTime,
//   res
// ) => {
//   try {
//     // Fallback if streaming returned empty
//     if (!fullResponse || fullResponse.trim() === "") {
//       const fallback = await fetch(
//         "https://openrouter.ai/api/v1/chat/completions",
//         {
//           method: "POST",
//           headers: {
//             Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             "Content-Type": "application/json",
//           },
//           body: JSON.stringify({
//             model: conversation.model || "mistralai/devstral-small",
//             messages: history,
//           }),
//         }
//       );

//       const data = await fallback.json();
//       fullResponse =
//         data?.choices?.[0]?.message?.content ||
//         "⚠️ AI returned an empty response.";
//     }

//     const latency = Date.now() - startTime;

//     await Message.create({
//       conversationId,
//       role: "assistant",
//       content: fullResponse,
//       tokenCount: estimateTokens(fullResponse),
//       latencyMs: latency,
//       status: "completed",
//     });

//     await Conversation.findByIdAndUpdate(conversationId, {
//       updatedAt: new Date(),
//     });

//     res.write(`data: [DONE]\n\n`);
//     res.end();

//   } catch (err) {
//     console.error("Finalize error:", err);
//     if (!res.headersSent) {
//       res.status(500).json({ error: "Failed to save response" });
//     } else {
//       res.end();
//     }
//   }
// };


export const finalizeResponse = async (
    fullResponse,
    history,
    conversation,
    conversationId,
    startTime,
    res // can be null
) => {
    try {
        // Fallback if streaming returned empty
        if (!fullResponse || fullResponse.trim() === "") {
            const fallback = await fetch(
                "https://openrouter.ai/api/v1/chat/completions",
                {
                    method: "POST",
                    headers: {
                        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        model: conversation.model || "mistralai/devstral-small",
                        messages: history,
                    }),
                }
            );

            const data = await fallback.json();
            fullResponse =
                data?.choices?.[0]?.message?.content ||
                "⚠️ AI returned an empty response.";
        }

        const latency = Date.now() - startTime;

        // Save assistant message
        await Message.create({
            conversationId,
            role: "assistant",
            content: fullResponse,
            tokenCount: estimateTokens(fullResponse),
            latencyMs: latency,
            status: "completed",
        });

        // Update conversation timestamp
        await Conversation.findByIdAndUpdate(conversationId, {
            updatedAt: new Date(),
        });

        // STREAMING MODE
        if (res) {
            try {
                res.write(`data: [DONE]\n\n`);
                res.end();
            } catch (err) {
                console.error("Failed to end streaming response:", err);
            }
        }

        // NON-STREAM MODE
        else {
            // nothing to do, just return the full response
            return fullResponse;
        }
    } catch (err) {
        console.error("Finalize error:", err);

        if (res) {
            if (!res.headersSent) {
                res.status(500).json({ error: "Failed to save response" });
            } else {
                res.end();
            }
        } else {
            // Non-stream mode: throw error so caller knows
            throw err;
        }
    }
};






/* -------------------------------------------------- */
/* GET MESSAGES */
/* -------------------------------------------------- */

export const getConversationMessagesService = async (
    userId,
    conversationId
) => {

    await verifyConversationOwnership(userId, conversationId);

    return await Message.find({ conversationId })
        .sort({ createdAt: 1 });
};


/* -------------------------------------------------- */
/* EDIT USER MESSAGE */
/* -------------------------------------------------- */

export const updateMessageService = async (
    userId,
    messageId,
    content
) => {



    const message = await Message.findById(messageId);

    if (!message) throw new NotFoundError("Message not found");

    await verifyConversationOwnership(userId, message.conversationId);

    if (message.role !== "user") {
        throw new NotFoundError("Only user messages can be edited");
    }

    message.content = content;
    message.tokenCount = estimateTokens(content);

    await message.save();

    return message;
};


/* -------------------------------------------------- */
/* REGENERATE USING FULL CONTEXT */
/* -------------------------------------------------- */


// export const regenerateMessageService = async (
//   userId,
//   messageId,
//   res
// ) => {

//   // 1️⃣ Find assistant message
//   const assistantMessage = await Message.findById(messageId);
//   if (!assistantMessage) {
//     throw new Error("Message not found");
//   }

//   // 2️⃣ Verify ownership
//   const conversation = await verifyConversationOwnership(
//     userId,
//     assistantMessage.conversationId
//   );

//   // 3️⃣ Ensure assistant role
//   if (assistantMessage.role !== "assistant") {
//     throw new Error("Only assistant messages can be regenerated");
//   }

//   // 4️⃣ Save current content as version
//   await MessageVersion.create({
//     messageId: assistantMessage._id,
//     content: assistantMessage.content,
//     model: assistantMessage.model || "gpt-3.5",
//     tokenCount: assistantMessage.tokenCount || 0,
//   });

//   // 5️⃣ Find related user message
//   const userMessage = await Message.findOne({
//     conversationId: conversation._id,
//     role: "user",
//     createdAt: { $lt: assistantMessage.createdAt },
//   }).sort({ createdAt: -1 });

//   if (!userMessage) {
//     throw new Error("No user message found for regeneration");
//   }

//   // 6️⃣ Call existing addMessageService (this creates NEW assistant message)
//  const newAssistantMessage = await addMessageService(
//   userId,
//   conversation._id,
//   userMessage.content,
//   null,
//   { skipUserMessage: true }
// );


//   // 7️⃣ Copy new content into OLD assistant message
//   assistantMessage.content = newAssistantMessage.content;
//   assistantMessage.tokenCount = newAssistantMessage.tokenCount;
//   assistantMessage.model = newAssistantMessage.model;

//   await assistantMessage.save();

//   // 8️⃣ Delete the temporary newly created assistant message
//   await Message.findByIdAndDelete(newAssistantMessage._id);

//   // 9️⃣ Return updated original assistant message
//   return assistantMessage;
// };


// export const regenerateMessageService = async (userId, messageId) => {
//   // 1️⃣ Find assistant message
//   const assistantMessage = await Message.findById(messageId);
//   if (!assistantMessage) throw new Error("Message not found");

//   // 2️⃣ Verify ownership
//   const conversation = await verifyConversationOwnership(userId, assistantMessage.conversationId);

//   // 3️⃣ Ensure assistant role
//   if (assistantMessage.role !== "assistant") {
//     throw new Error("Only assistant messages can be regenerated");
//   }

//   // 4️⃣ Save current content as version
//   await MessageVersion.create({
//     messageId: assistantMessage._id,
//     content: assistantMessage.content,
//     model: assistantMessage.model || "gpt-3.5",
//     tokenCount: assistantMessage.tokenCount || 0,
//   });

//   // 5️⃣ Find related user message (previous user message)
//   const userMessage = await Message.findOne({
//     conversationId: conversation._id,
//     role: "user",
//     createdAt: { $lt: assistantMessage.createdAt },
//   }).sort({ createdAt: -1 });

//   if (!userMessage) throw new Error("No user message found for regeneration");

//   // 6️⃣ Generate new assistant content (skip saving the user message)
//   const newAssistantData = await addMessageService(
//     userId,
//     conversation._id,
//     userMessage.content,
//     null,
//     { skipUserMessage: true } // important!
//   );

//   // 7️⃣ Update old assistant message with new content
//   assistantMessage.content = newAssistantData;
//   assistantMessage.tokenCount = estimateTokens(newAssistantData);
//   assistantMessage.model = conversation.model || "gpt-3.5";
//   await assistantMessage.save();

//   return assistantMessage;
// };


// export const regenerateMessageService = async (userId, messageId) => {
//   const assistantMessage = await Message.findById(messageId);
//   if (!assistantMessage) throw new Error("Message not found");

//   const conversation = await verifyConversationOwnership(
//     userId,
//     assistantMessage.conversationId
//   );

//   if (assistantMessage.role !== "assistant") {
//     throw new Error("Only assistant messages can be regenerated");
//   }

//   // Save current content as version
//   await MessageVersion.create({
//     messageId: assistantMessage._id,
//     content: assistantMessage.content,
//     model: assistantMessage.model || "gpt-3.5",
//     tokenCount: assistantMessage.tokenCount || 0,
//   });

//   // Get last user message
//   const userMessage = await Message.findOne({
//     conversationId: conversation._id,
//     role: "user",
//     createdAt: { $lt: assistantMessage.createdAt },
//   }).sort({ createdAt: -1 });

//   if (!userMessage) throw new Error("No user message found for regeneration");

//   // Call addMessageService in **non-stream mode** (res = null)
//   const newContent = await addMessageService(
//     userId,
//     conversation._id,
//     userMessage.content,
//     null // non-streaming
//   );

//   // Update old assistant message
//   assistantMessage.content = newContent; // new AI response
//   assistantMessage.tokenCount = estimateTokens(newContent);
//   assistantMessage.model = conversation.model || "gpt-3.5";
//   await assistantMessage.save();

//   return assistantMessage;
// };

// services/ai.service.js (or inside message.service.js)
// export const generateAIResponse = async (conversation, history) => {
//   try {
//     const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: conversation.model || "mistralai/devstral-small",
//         messages: history,
//       }),
//     });

//     const data = await response.json();
//     return data?.choices?.[0]?.message?.content || "⚠️ AI returned empty response";
//   } catch (err) {
//     console.error("Non-stream AI generation failed:", err);
//     throw new Error("Failed to generate AI response");
//   }
// };

// export const regenerateMessageService = async (userId, messageId) => {
//   console.log("🔹 Regeneration started for messageId:", messageId);

//   // 1️⃣ Find assistant message
//   const assistantMessage = await Message.findById(messageId);
//   if (!assistantMessage) throw new Error("Message not found");
//   console.log("✅ Assistant message found:", assistantMessage._id);

//   // 2️⃣ Verify conversation ownership
//   const conversation = await verifyConversationOwnership(
//     userId,
//     assistantMessage.conversationId
//   );
//   console.log("✅ Conversation verified:", conversation._id);

//   // 3️⃣ Ensure it's an assistant message
//   if (assistantMessage.role !== "assistant") {
//     throw new Error("Only assistant messages can be regenerated");
//   }

//   // 4️⃣ Save current content as a version
//   const version = await MessageVersion.create({
//     messageId: assistantMessage._id,
//     content: assistantMessage.content,
//     model: assistantMessage.model || "gpt-3.5",
//     tokenCount: assistantMessage.tokenCount || 0,
//   });
//   console.log("💾 Version saved with id:", version._id);

//   // 5️⃣ Find last user message
//   const userMessage = await Message.findOne({
//     conversationId: conversation._id,
//     role: "user",
//     createdAt: { $lt: assistantMessage.createdAt },
//   }).sort({ createdAt: -1 });
//   if (!userMessage) throw new Error("No user message found for regeneration");
//   console.log("✅ Last user message found:", userMessage._id);

//   // 6️⃣ Build conversation history
//   let history = await buildConversationHistory(conversation._id);
//   if (conversation.systemPrompt) {
//     history.unshift({ role: "system", content: conversation.systemPrompt });
//   }
//   console.log("✅ Conversation history built, length:", history.length);

//   // 7️⃣ Separate non-stream AI call
//   console.log("🤖 Calling AI to regenerate response...");
//   const newContent = await generateAIResponse(conversation, history);
//   console.log("✅ AI response received:", newContent.slice(0, 50) + "...");

//   // 8️⃣ Update original assistant message (keep _id)
//   assistantMessage.content = newContent;
//   assistantMessage.tokenCount = estimateTokens(newContent);
//   assistantMessage.model = conversation.model || "gpt-3.5";
//   await assistantMessage.save();
//   console.log("✅ Assistant message updated with regenerated content");

//   return assistantMessage; // same _id as original
// };





export const regenerateMessageService = async (userId, messageId, res) => {
    console.log("🔹 Regeneration started for messageId:", messageId);

    // 1️⃣ Find assistant message
    const assistantMessage = await Message.findById(messageId);
    if (!assistantMessage) throw new Error("Message not found");
    console.log("✅ Assistant message found:", assistantMessage._id);

    // 2️⃣ Verify conversation ownership
    const conversation = await verifyConversationOwnership(
        userId,
        assistantMessage.conversationId
    );
    console.log("✅ Conversation verified:", conversation._id);

    if (assistantMessage.role !== "assistant") {
        throw new Error("Only assistant messages can be regenerated");
    }

    // 3️⃣ Save current content as version
    const version = await MessageVersion.create({
        messageId: assistantMessage._id,
        content: assistantMessage.content,
        model: assistantMessage.model || "gpt-3.5",
        tokenCount: assistantMessage.tokenCount || 0,
    });
    console.log("💾 Version saved with id:", version._id);

    // 4️⃣ Build conversation history
    let history = await buildConversationHistory(conversation._id);
    if (conversation.systemPrompt) {
        history.unshift({ role: "system", content: conversation.systemPrompt });
    }
    console.log("✅ Conversation history built, length:", history.length);

    // 5️⃣ Setup streaming headers
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    let fullResponse = "";
    const startTime = Date.now();

    try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                "Content-Type": "application/json",
                "X-Title": "MERN ChatBot",
            },
            body: JSON.stringify({
                model: conversation.model || "mistralai/devstral-small",
                messages: history,
                stream: true,
            }),
        });

        if (!response.body) throw new Error("No response body from OpenRouter");

        // 6️⃣ Stream chunks from AI
        for await (const chunk of response.body) {
            const lines = chunk.toString().split("\n").filter(Boolean);
            for (const line of lines) {
                if (!line.startsWith("data:")) continue;
                const data = line.replace("data: ", "");
                if (data === "[DONE]") break;

                try {
                    const parsed = JSON.parse(data);
                    const token =
                        parsed?.choices?.[0]?.delta?.content ||
                        parsed?.choices?.[0]?.message?.content;

                    if (token) {
                        fullResponse += token;

                        // Stream chunk to frontend
                        res.write(`data: ${token}\n\n`);
                    }
                } catch (err) {
                    console.error("Malformed AI chunk:", err);
                }
            }
        }

        // 7️⃣ Save full response to original assistant message
        assistantMessage.content = fullResponse;
        assistantMessage.tokenCount = estimateTokens(fullResponse);
        assistantMessage.model = conversation.model || "gpt-3.5";
        await assistantMessage.save();

        // 8️⃣ Update conversation timestamp
        await Conversation.findByIdAndUpdate(conversation._id, { updatedAt: new Date() });

        // 9️⃣ End stream
        res.write("data: [DONE]\n\n");
        res.end();
        console.log("✅ Regeneration streaming complete");

    } catch (err) {
        console.error("Streaming regeneration failed:", err);
        try {
            if (!res.headersSent) {
                res.status(500).json({ error: "Failed to regenerate assistant message" });
            } else {
                res.end();
            }
        } catch (err2) {
            console.error("Failed to end response after error:", err2);
        }
    }
};










