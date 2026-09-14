import jwt from "jsonwebtoken";
import { verifyAccessToken } from "../services/token.service.js";

const userAuthenticatedMiddlware = (req, res, next) => {
  try {
    const accessToken = req.cookies?.accessToken;

    // CASE 1: No Access Token
    // This happens if the user just logged out, hasn't logged in yet, 
    // or the browser automatically deleted the expired cookie.
    if (!accessToken) {
      console.warn(`[Auth] Missing token on ${req.originalUrl} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        code: "NO_ACCESS_TOKEN",
        message: "Access token missing.",
      });
    }

    // Attempt to verify the token
    const decoded = verifyAccessToken(accessToken);

    // If successful, attach decoded user payload to the request object
    req.user = decoded;
    
    // Proceed to the next middleware or route handler
    next();
    
  } catch (error) {
    // CASE 3 (from our discussion): Token Expired
    // This happens due to client/server clock skew, API clients like Postman, 
    // or slight browser delays in deleting the expired cookie.
    if (error instanceof jwt.TokenExpiredError) {
      console.warn(`[Auth] Expired token used on ${req.originalUrl} from IP: ${req.ip}`);
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Access token expired.",
      });
    }

    // CASE 2: Invalid Access Token
    // This happens if the token signature is wrong, token is malformed, 
    // or someone is trying to tamper with the JWT payload.
    if (error instanceof jwt.JsonWebTokenError) {
      console.error(`[Auth Security] Invalid/Tampered token on ${req.originalUrl} from IP: ${req.ip}. Error: ${error.message}`);
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid access token.",
      });
    }

    // FALLBACK: Catch any other unexpected server errors
    console.error(`[Auth Error] Unexpected error on ${req.originalUrl}:`, error);
    return res.status(500).json({
      success: false,
      message: "Authentication failed due to an internal error.",
    });
  }
};

export { userAuthenticatedMiddlware };