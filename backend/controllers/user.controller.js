import User from "../models/user.model.js"; // Adjust the path to your User model

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

export { getProfileController };