import jwt from "jsonwebtoken";
import crypto from "crypto";

// token.service.js

 const generateAccessToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email,
    },
    process.env.ACCESS_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

 const generateRefreshToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
    },
    process.env.REFRESH_TOKEN_SECRET_KEY,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

const hashRefreshToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET_KEY);
};

export {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};