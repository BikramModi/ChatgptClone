import swaggerJsdoc from "swagger-jsdoc";

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "MERN AI SaaS API",
            version: "1.0.0",
            description: "API documentation for AI Chat SaaS with JWT Cookie Auth",
        },
        servers: [
            {
                url: "http://localhost:6005",
            },
        ],

        components: {
            securitySchemes: {
                cookieAuth: {
                    type: "apiKey",
                    in: "cookie",
                    name: "accessToken",
                },
            },

            schemas: {
                User: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        name: {
                            type: "string",
                            example: "John Doe"
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "john@example.com"
                        },
                        role: {
                            type: "string",
                            enum: ["user", "admin", "moderator"],
                            example: "user"
                        },
                        status: {
                            type: "string",
                            enum: ["active", "suspended", "deleted"],
                            example: "active"
                        },
                        emailVerified: {
                            type: "boolean",
                            example: false
                        },
                        lastLoginAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-20T10:00:00.000Z"
                        },
                        phone: {
                            type: "string",
                            example: "+1234567890"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },


                RegisterRequest: {
                    type: "object",
                    required: ["name", "email", "password"],
                    properties: {
                        name: { type: "string" },
                        email: { type: "string", format: "email" },
                        password: { type: "string", format: "password" },
                        phone: { type: "string" }
                    }
                },

                LoginRequest: {
                    type: "object",
                    required: ["email", "password"],
                    properties: {
                        email: { type: "string", format: "email" },
                        password: { type: "string", format: "password" }
                    }
                },



                Conversation: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        user: { type: "string" },
                        title: { type: "string" },
                        model: { type: "string" },
                        systemPrompt: { type: "string" },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },

                Message: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        conversationId: { type: "string" },
                        role: { type: "string", enum: ["user", "assistant"] },
                        content: { type: "string" },
                        tokenCount: { type: "number" },
                        latencyMs: { type: "number" },
                        status: {
                            type: "string",
                            enum: ["completed", "blocked"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },

                ContentFlag: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        messageId: { type: "string" },
                        category: {
                            type: "string",
                            enum: ["hate", "violence", "self-harm"],
                        },
                        severity: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                        },
                        actionTaken: {
                            type: "string",
                            enum: ["none", "masked", "blocked"],
                        },
                        createdAt: { type: "string", format: "date-time" },
                    },
                },

                UsageMetric: {
                    type: "object",
                    properties: {
                        _id: { type: "string" },
                        userId: { type: "string" },
                        periodStart: { type: "string", format: "date" },
                        periodEnd: { type: "string", format: "date" },
                        totalMessages: { type: "number" },
                        totalTokens: { type: "number" },
                        totalCost: { type: "string" },
                    },
                },
            },
        },

        security: [
            {
                cookieAuth: [],
            },
        ],

        tags: [
            { name: "Auth" },
            { name: "Conversations" },
            { name: "Messages" },
            { name: "Content Flags" },
            { name: "Usage" },
        ],
    },

    apis: ["./src/handlers/*.js"],  // <-- Point to your route handler files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
