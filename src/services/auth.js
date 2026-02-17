// import { createUser } from "./user.js";
// import User from "../models/user.js";
// import jwt from "jsonwebtoken";
// import NotFoundError from "../errors/not-found-error.js";
// import UnauthorizedError from "../errors/unauthorized-error.js";
// import { compare } from "bcrypt";

// export const register = async (userData) => {
//   const user = await createUser(userData);

//   const token = jwt.sign(
//     { userId: user._id.toString() ,
//       role: user.role, // 👈 add role here

//     },
//     process.env.JWT_SECRET_KEY,
//     {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     }
//   );

//   return {
//     token,
//     user,
//   };
// };

// export const login = async (userData) => {
//   const user = await User.findOne({ email: userData.email });
//   if (!user) {
//     throw new NotFoundError("This email is not registered.");
//   }
//   const isPasswordValid = await compare(userData.password, user.password);
//   if (!isPasswordValid) {
//     throw new UnauthorizedError("Invalid credentials");
//   }
//   const token = jwt.sign(
//     { userId: user._id.toString() ,
//       role: user.role, // 👈 add role here

//     },
//     process.env.JWT_SECRET_KEY,
//     {
//       expiresIn: process.env.JWT_EXPIRES_IN,
//     }
//   );
//   return {
//     token,
//     user,
//   };
// };



//code for http only cookie implementation


import { createUser } from "./user.js";
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import NotFoundError from "../errors/not-found-error.js";
import UnauthorizedError from "../errors/unauthorized-error.js";
import { compare } from "bcrypt";

import Session from "../models/Session.js";
import AuditLog from "../models/auditLog.js";


export const register = async (userData, res) => {
  const user = await createUser(userData);

  const token = jwt.sign(
    {
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3h" }
  );

  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", //true in production, false in development
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 3, // 3 hours
  });

  return {
    user,
  };
};




export const login = async (userData, res, req) => {
  console.log("Login request received with data:", userData);

  const user = await User.findOne({ email: userData.email });
  if (!user) {
    throw new NotFoundError("This email is not registered.");
  }

  const isPasswordValid = await compare(userData.password, user.password);
  if (!isPasswordValid) {
    throw new UnauthorizedError("Invalid credentials");
  }

  // ✅ Update last login time
  user.lastLoginAt = new Date();
  await user.save();

  // ✅ Create session
  const session = new Session({
    userId: user._id,
    userAgent: req.headers["user-agent"],
    ipAddress: req.ip,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const token = jwt.sign(
    {
      sessionId: session._id.toString(),
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "3h" }
  );

  const refreshToken = jwt.sign(
    {
      sessionId: session._id.toString(),
      userId: user._id.toString(),
      role: user.role,
    },
    process.env.REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  session.refreshToken = refreshToken;
  await session.save();

  // ✅ Set cookies
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 3, // 3 hours
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });

  // ✅ Create audit log
  try {
    await AuditLog.create({
      actorId: user._id,
      action: "USER_LOGGED_IN",
      entity: "User",
      entityId: user._id,
      metadata: {
        sessionId: session._id,
        ip: req.ip,
        userAgent: req.headers["user-agent"],
      },
    });
  } catch (err) {
    console.error("Failed to create audit log:", err);
  }

  const { password, ...userWithoutPassword } = user.toObject();

  return {
    user: userWithoutPassword,
  };
};


