const router = require("express").Router();
const User = require("../models/User");
const { verifyToken } = require("../middleware/auth");

// Get user by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return user data without password
    const { password, ...userWithoutPassword } = user._doc;
    res.status(200).json(userWithoutPassword);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Search users by username
router.get("/search/:username", verifyToken, async (req, res) => {
  try {
    const users = await User.find({
      username: { $regex: req.params.username, $options: "i" },
      _id: { $ne: req.user.id }, // Exclude the current user
    }).select("-password");

    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
