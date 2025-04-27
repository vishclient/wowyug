const router = require("express").Router();
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/images"));
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const fileTypes = /jpeg|jpg|png|gif/;
    const extname = fileTypes.test(
      path.extname(file.originalname).toLowerCase(),
    );
    const mimetype = fileTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"));
    }
  },
});

// Register a new user
router.post("/signup", upload.single("profilePicture"), async (req, res) => {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists" });
    }

    const existingUsername = await User.findOne({
      username: req.body.username,
    });
    if (existingUsername) {
      return res.status(400).json({ message: "Username is already taken" });
    }

    // Create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      profilePicture: req.file ? `/images/${req.file.filename}` : "",
    });

    // Save user and return response
    const savedUser = await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: savedUser._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data without password
    const { password, ...userWithoutPassword } = savedUser._doc;

    res.status(201).json({
      ...userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Login user
router.post("/signin", async (req, res) => {
  try {
    // Find user by email
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const validPassword = await user.comparePassword(req.body.password);
    if (!validPassword) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    // Return user data without password
    const { password, ...userWithoutPassword } = user._doc;

    res.status(200).json({
      ...userWithoutPassword,
      token,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
