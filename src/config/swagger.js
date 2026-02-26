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
                //url: "https://measuringly-joltiest-gayle.ngrok-free.dev"
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

                UserPreference: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        userId: {
                            type: "string",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        defaultModel: {
                            type: "string",
                            example: "gpt-3.5"
                        },
                        temperature: {
                            type: "number",
                            example: 0.7
                        },
                        tone: {
                            type: "string",
                            enum: ["formal", "casual"],
                            example: "formal"
                        },
                        theme: {
                            type: "string",
                            enum: ["light", "dark"],
                            example: "light"
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

                Conversation: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        userId: {
                            type: "string",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        title: {
                            type: "string",
                            example: "My AI Business Ideas"
                        },
                        model: {
                            type: "string",
                            example: "gpt-3.5"
                        },
                        systemPrompt: {
                            type: "string",
                            example: "You are a helpful AI assistant."
                        },
                        visibility: {
                            type: "string",
                            enum: ["private", "shared"],
                            example: "private"
                        },
                        isArchived: {
                            type: "boolean",
                            example: false
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
                CreateConversationRequest: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            example: "Startup Ideas"
                        },
                        model: {
                            type: "string",
                            example: "gpt-3.5"
                        },
                        systemPrompt: {
                            type: "string",
                            example: "You are a helpful AI mentor."
                        },
                        visibility: {
                            type: "string",
                            enum: ["private", "shared"],
                            example: "private"
                        }
                    }
                },
                UpdateConversationRequest: {
                    type: "object",
                    properties: {
                        title: {
                            type: "string",
                            example: "Updated Chat Title"
                        },
                        visibility: {
                            type: "string",
                            enum: ["private", "shared"],
                            example: "shared"
                        },
                        isArchived: {
                            type: "boolean",
                            example: true
                        },
                        systemPrompt: {
                            type: "string",
                            example: "Act as a senior software architect."
                        }
                    }
                },



                Message: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f2d1a7c123456789abcd12"
                        },
                        conversationId: {
                            type: "string",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        role: {
                            type: "string",
                            enum: ["user", "assistant", "system"],
                            example: "user"
                        },
                        content: {
                            type: "string",
                            example: "Explain microservices architecture."
                        },
                        tokenCount: {
                            type: "number",
                            example: 125
                        },
                        latencyMs: {
                            type: "number",
                            example: 842
                        },
                        status: {
                            type: "string",
                            enum: ["completed", "streaming", "failed"],
                            example: "completed"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time"
                        }
                    }
                },


                MessageVersion: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f3a9c7e4b123456789abcd"
                        },
                        messageId: {
                            type: "string",
                            description: "Reference to original message",
                            example: "65f2d1a7c123456789abcd12"
                        },
                        content: {
                            type: "string",
                            example: "Here is an improved version of your previous answer..."
                        },
                        model: {
                            type: "string",
                            example: "gpt-3.5"
                        },
                        tokenCount: {
                            type: "number",
                            example: 180
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-26T10:00:00.000Z"
                        }
                    }
                },

                ContentFlag: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f4b2c8d4e123456789abcd"
                        },
                        messageId: {
                            type: "string",
                            description: "Reference to the flagged message",
                            example: "65f2d1a7c123456789abcd12"
                        },
                        category: {
                            type: "string",
                            enum: ["hate", "violence", "self-harm"],
                            example: "hate"
                        },
                        severity: {
                            type: "string",
                            enum: ["low", "medium", "high"],
                            example: "medium"
                        },
                        actionTaken: {
                            type: "string",
                            enum: ["none", "masked", "blocked"],
                            example: "masked"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-26T10:30:00.000Z"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-26T10:35:00.000Z"
                        }
                    }
                },

                UsageMetric: {
                    type: "object",
                    properties: {
                        _id: {
                            type: "string",
                            example: "65f5c9a1d4e123456789abcd"
                        },
                        userId: {
                            type: "string",
                            description: "Reference to the user",
                            example: "65f2c8b5d4e123456789abcd"
                        },
                        periodStart: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-01T00:00:00.000Z"
                        },
                        periodEnd: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-28T23:59:59.999Z"
                        },
                        totalMessages: {
                            type: "number",
                            example: 120
                        },
                        totalTokens: {
                            type: "number",
                            example: 15432
                        },
                        totalCost: {
                            type: "string",
                            description: "Total cost for the period (Decimal128 stored as string)",
                            example: "12.75"
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-28T23:59:59.999Z"
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-02-28T23:59:59.999Z"
                        }
                    }
                }


            },
        },

        security: [
            {
                cookieAuth: [],
            },
        ],

        tags: [
            { name: "Users" },
            { name: "Auth" },
            { name: "Preferences" },
            { name: "Conversations" },
            { name: "Messages" },
            { name: "MessageVersions" },
            { name: "Content Flags" },
            { name: "Usage" },
        ],
    },

    apis: ["./src/handlers/*.js"],  // <-- Point to your route handler files with JSDoc comments
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
