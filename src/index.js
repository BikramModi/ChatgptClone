import express from "express";
import connectDB from "./config/database.js";
import HANDLERS from "./handlers/index.js";
import errorMiddleware from "./middlewares/error.js";
import { authMiddleware } from "./middlewares/auth.js";
import cors from "cors";

import cookieParser from "cookie-parser";

const SERVER = express();

const PORT = process.env.PORT;

connectDB();


// 1️⃣ Only use JSON parser for non-webhook routes
SERVER.use((req, res, next) => {
  if (req.path === "/payments/webhook") return next(); // skip JSON parser
  express.json()(req, res, next);
});


/*
// 2️⃣ Apply auth middleware for all except webhook
SERVER.use((req, res, next) => {
  if (req.path === "/payments/webhook") return next(); // skip auth
  authMiddleware(req, res, next);
});
*/

//SERVER.use(express.json());


SERVER.use(
  cors({
    origin: "http://localhost:5173", // your frontend
    credentials: true,
  })
);

SERVER.use(cookieParser());

SERVER.use(authMiddleware);
SERVER.use("/", HANDLERS);
SERVER.use(errorMiddleware);

SERVER.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  
});
