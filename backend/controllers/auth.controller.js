import bcrypt from "bcryptjs";
import User from "../models/user.model.js";
import { 
  accessCookieOptions, 
  refreshCookieOptions 
} from "../utils/cookie.config.js";

import {
  generateAccessToken,
  generateRefreshToken,
  hashRefreshToken,
  verifyRefreshToken,
} from "../services/token.service.js";


/* ==========================
   REGISTER CONTROLLER
========================== */

const registerController = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmPassword,
    } = req.body;

    // Basic Validation
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields.",
      });
    }

    // Password Match Validation
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match.",
      });
    }

    // Password Length
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters.",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email already registered.",
      });
    }

    // Hash Password
    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

    // Create User
    const newUser = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    // Success Response
    return res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* ==========================
   LOGIN CONTROLLER
========================== */

const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Basic Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find User
    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Compare Password
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    /* ==========================
       GENERATE TOKENS
    ========================== */

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);
    /* ==========================
       HASH REFRESH TOKEN
       Store ONLY the hash in DB
    ========================== */

    const refreshTokenHash =
      hashRefreshToken(refreshToken);


    user.refreshTokenHash = refreshTokenHash;

    await user.save();

    /* ==========================
       SET HTTPONLY COOKIES
    ========================== */

    res.cookie(
      "accessToken",
      accessToken,
      accessCookieOptions
    );

    res.cookie(
      "refreshToken",
      refreshToken,
      refreshCookieOptions
    );

    /* ==========================
       RESPONSE
    ========================== */

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

/* ==========================
   REFRESH ACCESS TOKEN
========================== */

const refreshTokenController = async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        code: "REFRESH_TOKEN_MISSING",
      });
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken);

    // Find user
    const user = await User.findById(decoded.userId);

    if (!user || !user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Compare hash
    const incomingHash = hashRefreshToken(refreshToken);

    if (incomingHash !== user.refreshTokenHash) {
      return res.status(401).json({
        success: false,
        code: "INVALID_REFRESH_TOKEN",
      });
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshTokenHash = hashRefreshToken(newRefreshToken);
    await user.save();

    // Send new cookies
    res.cookie("accessToken", newAccessToken, accessCookieOptions);
    res.cookie("refreshToken", newRefreshToken, refreshCookieOptions);

    return res.status(200).json({
      success: true,
      message: "Access token refreshed.",
    });

  } catch (error) {

    // Refresh token expired or invalid
    res.clearCookie("accessToken", { path: "/" });
    res.clearCookie("refreshToken", { path: "/" });

    return res.status(401).json({
      success: false,
      code:
        error.name === "TokenExpiredError"
          ? "REFRESH_TOKEN_EXPIRED"
          : "INVALID_REFRESH_TOKEN",
      message:
        error.name === "TokenExpiredError"
          ? "Refresh token expired."
          : "Invalid refresh token.",
    });
  }
};
/* ==========================
   LOGOUT CONTROLLER
========================== */

const logoutController = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      try {
        const decoded =
          verifyRefreshToken(refreshToken);

        await User.findByIdAndUpdate(
          decoded.userId,
          {
            $set: {
              refreshTokenHash: null,
            },
          }
        );
      } catch (error) {
        // Token already invalid/expired.
        // We still clear the cookies.
      }
    }

    // Clear cookies
    res.clearCookie(
      "accessToken",
      accessCookieOptions
    );

    res.clearCookie(
      "refreshToken",
      refreshCookieOptions
    );

    return res.status(200).json({
      success: true,
      message: "Logged out successfully.",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
    });
  }
};

export {
  loginController,
  registerController,
  refreshTokenController,
  logoutController,
};
