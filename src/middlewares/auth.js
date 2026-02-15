// import jwt from "jsonwebtoken";

// const publicRoutes = ["/auth/login", "/auth/register", "/payment/esewa/success", "/payment/esewa/failure", "/payments/webhook", "/payment/khalti/verify"];

// export const authMiddleware = (req, res, next) => {
//   if (publicRoutes.includes(req.path)) {
//     return next();
//   }
//   const [type, token] = req.headers.authorization?.split(" ") || [];
//   if (!token || type !== "Bearer") {
//     return res.status(401).json({ message: "Unauthorized" });
//   }
//   const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
//   req.user = decoded;
//   next();
// };




//code for http only cookie implementation

// import jwt from "jsonwebtoken";

// import Session from "../models/Session.js";

// const publicRoutes = [
//   "/auth/login",
//   "/auth/register",
//   "/auth/refresh",   // ✅ yes include this
//   "/payment/esewa/success",
//   "/payment/esewa/failure",
//   "/payments/webhook",
//   "/payment/khalti/verify",
// ];

// export const authMiddleware = async (req, res, next) => {
//   if (
//     publicRoutes.some((route) =>
//       req.originalUrl.startsWith(route)
//     )
//   ) {
//     return next();
//   }

//   const token = req.cookies.accessToken;

//   if (!token) {
//     return res.status(401).json({ message: "Unauthorized" });
//   }

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

//     const session = await Session.findById(decoded.sessionId);

//     if (!session || session.isValid === false) {
//       return res.status(401).json({ message: "Session expired" });
//     }

//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ message: "Invalid token expired" });
//   }
// };




import jwt from "jsonwebtoken";
import Session from "../models/Session.js";

const publicRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/refresh",   // include refresh route
  "/auth/logout",    // include logout route
  "/payment/esewa/success",
  "/payment/esewa/failure",
  "/payments/webhook",
  "/payment/khalti/verify",
];

export const authMiddleware = async (req, res, next) => {
  if (
    publicRoutes.some((route) => req.originalUrl.startsWith(route))
  ) {
    return next();
  }

  const accessToken = req.cookies.accessToken;
  const refreshToken = req.cookies.refreshToken;

  if (!accessToken) {
    return res.status(401).json({ message: "Access token missing" });
  }

  try {
    const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_KEY);

    const session = await Session.findById(decoded.sessionId);
    if (!session || session.isValid === false) {
      return res.status(401).json({ message: "Session invalid" });
    }

    req.user = decoded; // user info for downstream routes
    next();
  } catch (err) {
    // Check if error is token expired
    if (err.name === "TokenExpiredError") {
      // Access token expired, check refresh token
      if (!refreshToken) {
        return res.status(401).json({ message: "Access token expired, refresh token missing" });
      }

      try {
        const decodedRefresh = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
        const session = await Session.findById(decodedRefresh.sessionId);

        if (!session || !session.isValid) {
          return res.status(401).json({ message: "Refresh token expired, please login again" });
        }

        if (session.refreshToken !== refreshToken) {
          return res.status(401).json({ message: "Refresh token mismatch, please login again" });
        }

        // Refresh token valid → frontend can call /auth/refresh
        return res.status(403).json({ message: "Access token expired, refresh available" });

      } catch (refreshErr) {
        return res.status(401).json({ message: "Refresh token invalid or expired" });
      }
    }

    // Any other token error
    return res.status(401).json({ message: "Invalid access token" });
  }
};
