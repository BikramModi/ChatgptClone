// import Router from "express";
// import useValidator from "../middlewares/useValidator.js";
// import { register, login } from "../services/auth.js";
// import { createUserValidator } from "../validators/user.js";
// import { loginValidator } from "../validators/auth.js";

// const AUTH_ROUTER = Router();

// AUTH_ROUTER.post(
//   "/register",
//   useValidator(createUserValidator),
//   async (req, res, next) => {
//     try {
//       const result = await register(req.body);
//       res.status(201).json(result);
//     } catch (error) {
//       next(error);
//     }
//   }
// );

// AUTH_ROUTER.post(
//   "/login",
//   useValidator(loginValidator),
//   async (req, res, next) => {
//     try {
//       const result = await login(req.body);
//       res.status(200).json(result);
//     } catch (error) {
//       next(error);
//     }
//   }
// );



// export default AUTH_ROUTER;




//code for http only cookie implementation

import Router from "express";
import useValidator from "../middlewares/useValidator.js";
import { register, login } from "../services/auth.js";
import { createUserValidator } from "../validators/user.js";
import { loginValidator } from "../validators/auth.js";

import jwt from "jsonwebtoken";
import User from "../models/user.js";
import Session from "../models/Session.js";
import AuditLog from "../models/auditLog.js";

const AUTH_ROUTER = Router();

AUTH_ROUTER.post(
  "/register",
  useValidator(createUserValidator),
  async (req, res, next) => {
    try {
      const result = await register(req.body, res); // Pass res to set cookie
      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }
);

AUTH_ROUTER.post(
  "/login",
  useValidator(loginValidator),
  async (req, res, next) => {
    try {
      const result = await login(req.body, res, req); // Pass res and req to set cookie
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
);

// AUTH_ROUTER.post("/logout", async (req, res) => {


//   const token = req.cookies.accessToken;
//   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//   await Session.findByIdAndUpdate(decoded.sessionId, {
//     isValid: false,
//   });


//   res.clearCookie("accessToken");
//   res.clearCookie("refreshToken");
//   res.json({ message: "Logged out" });
// });



AUTH_ROUTER.post("/logout", async (req, res) => {
  try {
    const { refreshToken } = req.cookies;

    if (refreshToken) {
      // 1️⃣ Find the session first
      const session = await Session.findOne({ refreshToken });

      if (session) {
        // 2️⃣ Revoke session
        session.revokedAt = new Date();
        session.isValid = false;
        await session.save();

        // 3️⃣ Create audit log
        try {
          await AuditLog.create({
            actorId: session.userId,
            action: "USER_LOGGED_OUT",
            entity: "User",
            entityId: session.userId,
            metadata: {
              sessionId: session._id,
              ip: req.ip,
              userAgent: req.headers["user-agent"],
            },
          });
        } catch (auditErr) {
          console.error("Audit log failed:", auditErr);
        }
      }
    }

    // 4️⃣ Clear cookies
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    return res.json({ message: "Logged out" });

  } catch (error) {
    return res.status(500).json({ message: "Logout failed" });
  }
});




AUTH_ROUTER.get("/me", async (req, res) => {
  try {
    const token = req.cookies.accessToken; // HTTP-only cookie
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decoded.userId).select("-password");
    res.json({ user });
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
});


// AUTH_ROUTER.post("/refresh", async (req, res) => {
//   try {
//     const refreshToken = req.cookies.refreshToken;
//     if (!refreshToken)
//       return res.status(401).json({ message: "Unauthorized" });

//     const decoded = jwt.verify(
//       refreshToken,
//       process.env.REFRESH_SECRET
//     );

//     const session = await Session.findById(decoded.sessionId);

//     if (!session || !session.isValid)
//       return res.status(401).json({ message: "Invalid session" });

//     if (session.refreshToken !== refreshToken)
//       return res.status(401).json({ message: "Token mismatch" });

//     // 🔁 ROTATION STARTS HERE

//     // 1️⃣ Invalidate old refresh token
//     session.isValid = false;
//     await session.save();

//     // 2️⃣ Create new session
//   const newSession = new Session({
//   userId: decoded.userId,
//   userAgent: req.headers["user-agent"],
//   ipAddress: req.ip,
//   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
// });


//     const newRefreshToken = jwt.sign(
//       {
//         sessionId: newSession._id.toString(),
//         userId: decoded.userId,
//       },
//       process.env.REFRESH_SECRET,
//       { expiresIn: "7d" }
//     );

//     newSession.refreshToken = newRefreshToken;
//     await newSession.save();

//     const newAccessToken = jwt.sign(
//       {
//         sessionId: newSession._id.toString(),
//         userId: decoded.userId,
//         role: decoded.role,
//       },
//       process.env.JWT_SECRET_KEY,
//       { expiresIn: "15m" }
//     );

//     // 3️⃣ Set new cookies
//     res.cookie("accessToken", newAccessToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 15,
//     });

//     res.cookie("refreshToken", newRefreshToken, {
//       httpOnly: true,
//       secure: process.env.NODE_ENV === "production",
//       sameSite: "lax",
//       maxAge: 1000 * 60 * 60 * 24 * 7,
//     });

//     res.json({ message: "Token refreshed" });

//   } catch (err) {
//     return res.status(401).json({ message: "Invalid refresh token" });
//   }
// });


AUTH_ROUTER.post("/refresh", async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken)
      return res.status(401).json({ message: "Unauthorized" });

    // Verify old refresh token
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);

    const session = await Session.findById(decoded.sessionId);

    if (!session || !session.isValid)
      return res.status(401).json({ message: "Invalid session" });

    if (session.refreshToken !== refreshToken)
      return res.status(401).json({ message: "Token mismatch" });

    // 🔁 ROTATE TOKENS (update existing session)
    const newRefreshToken = jwt.sign(
      {
        sessionId: session._id.toString(),
        userId: decoded.userId,
        role: decoded.role,
      },
      process.env.REFRESH_SECRET,
      { expiresIn: "5m" }
    );

    session.refreshToken = newRefreshToken;
    session.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // extend 7 days
    await session.save();

    const newAccessToken = jwt.sign(
      {
        sessionId: session._id.toString(),
        userId: decoded.userId,
        role: decoded.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "3m" }
    );

    // Set new cookies
    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 3, // 3 minutes
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 1000 * 60 * 5, // 5 minutes
    });

    res.json({ message: "Token refreshed" });
  } catch (err) {
    console.log(err);
    return res.status(401).json({ message: "Invalid refresh token" });
  }
});




export default AUTH_ROUTER;