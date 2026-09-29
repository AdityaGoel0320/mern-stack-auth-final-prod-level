import User from "../models/user.model.js"; // Adjust the path to your User model
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getProfileController = async (req, res) => {
  try {
    // Extract the user ID from the decoded JWT payload attached by the middleware.
    // (Make sure "id" matches whatever property name you put inside your token payload, e.g., req.user.userId)
    const userId = req.user.userId;

    // Fetch the user from the database and exclude sensitive fields like the password hash
    const user = await User.findById(userId).select("-password");

    // Handle the edge case where the token is valid, but the user was deleted from the DB
    if (!user) {
      console.warn(`[Auth Warning] User ID ${userId} found in token but not in database.`);
      return res.status(404).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User profile fetched successfully.",
      user,
    });

  } catch (error) {
    console.error(`[Profile Error] Failed to fetch profile for user ${req.user?.userId}:`, error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching user profile.",
    });
  }
};

const updateAvatarController = async (req, res) => {
  try {
    const userId = req.user.userId;

    let avatarUrl;

    // =========================================
    // 1. CUSTOM IMAGE UPLOAD
    // =========================================
    if (req.files?.avatar?.length > 0) {
      const avatarFile = req.files.avatar[0];

      console.log("Avatar file:", avatarFile);

      // Upload local file to Cloudinary
      const cloudinaryResponse = await uploadOnCloudinary(
        avatarFile.path
      );

      if (!cloudinaryResponse) {
        return res.status(500).json({
          success: false,
          message: "Failed to upload avatar.",
        });
      }

      avatarUrl = cloudinaryResponse.secure_url;
    }

    // =========================================
    // 2. PRESET AVATAR URL
    // =========================================
    else if (req.body?.avatar) {
      avatarUrl = req.body.avatar;
    }

    // =========================================
    // 3. NOTHING PROVIDED
    // =========================================
    else {
      return res.status(400).json({
        success: false,
        message: "Avatar image or URL is required.",
      });
    }

    // =========================================
    // 4. UPDATE DATABASE
    // =========================================
    const user = await User.findByIdAndUpdate(
      userId,
      {
        avatar: avatarUrl,
      },
      {
        returnDocument: "after",
        runValidators: true,
      }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account no longer exists.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Avatar updated successfully.",
      user,
    });

  } catch (error) {
    console.error(
      `[Avatar Update Error] Failed to update avatar for user ${req.user?.userId}:`,
      error
    );

    return res.status(500).json({
      success: false,
      message: "Internal server error while updating avatar.",
    });
  }
};

export { getProfileController, updateAvatarController };