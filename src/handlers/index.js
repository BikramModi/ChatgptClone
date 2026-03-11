import Router from "express";
import USER_ROUTER from "./user.js";
import AUTH_ROUTER from "./auth.js";

import PREFERENCE_ROUTER from "./userPreference.handler.js";



import CONVERSATION_ROUTER from "./conversation.handler.js";
import MESSAGE_ROUTER from "./message.handler.js";
import MESSAGE_VERSION_ROUTER from "./messageversion.handler.js";
import CONTENT_FLAG_ROUTER from "./contentflag.handler.js";
import METRIC_ROUTER from "./metricusage,handler.js";


const HANDLERS = Router();


HANDLERS.use("/users", USER_ROUTER);
HANDLERS.use("/auth", AUTH_ROUTER);

HANDLERS.use("/preferences", PREFERENCE_ROUTER);
HANDLERS.use("/conversations", CONVERSATION_ROUTER);
HANDLERS.use("/messages", MESSAGE_ROUTER);
HANDLERS.use("/messagesvr", MESSAGE_VERSION_ROUTER);
HANDLERS.use("/flags", CONTENT_FLAG_ROUTER);
HANDLERS.use("/metrics", METRIC_ROUTER);






export default HANDLERS;
